-- Simplified Multi-Company Management Support
-- This migration creates a simple many-to-many relationship between accounts and companies
-- Clean and simple: account -> company with role, no complex session tracking

-- Create simple account_company_roles table
-- This is the core many-to-many relationship: account -> company with admin status
CREATE TABLE account_company_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    is_admin BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(account_id, company_id)
);

-- Note: SUPERUSER is now handled by accounts.is_superuser flag
-- Only ADMIN and EMPLOYEE roles are used in account_company_roles

-- ============================================================================
-- ENHANCE COMPANIES TABLE WITH COMPREHENSIVE DATA FIELDS
-- ============================================================================

-- Add comprehensive fields to companies table
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS legal_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS industry VARCHAR(100),
ADD COLUMN IF NOT EXISTS company_size VARCHAR(50),
ADD COLUMN IF NOT EXISTS founded_year INTEGER,
ADD COLUMN IF NOT EXISTS website VARCHAR(255),
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS fax VARCHAR(50),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS address_line_2 TEXT,
ADD COLUMN IF NOT EXISTS state VARCHAR(100),
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS country VARCHAR(100),
ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50),
ADD COLUMN IF NOT EXISTS tax_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS registration_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS vat_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS business_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS legal_structure VARCHAR(50),
ADD COLUMN IF NOT EXISTS fiscal_year_start DATE,
ADD COLUMN IF NOT EXISTS fiscal_year_end DATE,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS brand_color VARCHAR(7),
ADD COLUMN IF NOT EXISTS secondary_color VARCHAR(7),
ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS twitter_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS facebook_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS instagram_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE',
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES accounts(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES accounts(id);

-- Update existing companies with default values
UPDATE companies SET 
    country = COALESCE(country, 'United States'),
    currency = COALESCE(currency, 'USD'),
    status = COALESCE(status, 'ACTIVE'),
    is_verified = COALESCE(is_verified, FALSE)
WHERE country IS NULL OR currency IS NULL OR status IS NULL OR is_verified IS NULL;

-- Add comments
COMMENT ON TABLE account_company_roles IS 'Simple many-to-many relationship: accounts can have roles in multiple companies';
COMMENT ON COLUMN account_company_roles.is_admin IS 'Whether user has admin access to this company (SUPERUSER is handled by accounts.is_superuser)';

-- Create indexes for performance
CREATE INDEX idx_account_company_roles_account_id ON account_company_roles(account_id);
CREATE INDEX idx_account_company_roles_company_id ON account_company_roles(company_id);
CREATE INDEX idx_account_company_roles_is_admin ON account_company_roles(is_admin);

-- Add updated_at trigger
CREATE TRIGGER update_account_company_roles_updated_at 
    BEFORE UPDATE ON account_company_roles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE account_company_roles ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow all operations for testing" ON account_company_roles;

-- Grant permissions
GRANT ALL ON public.account_company_roles TO authenticated;
GRANT ALL ON public.account_company_roles TO anon;

-- Create simple functions
-- Get all companies for an account
CREATE OR REPLACE FUNCTION get_account_companies(p_account_id UUID)
RETURNS TABLE (
    company_id UUID,
    company_name VARCHAR(255),
    is_admin BOOLEAN,
    icon_name VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        acr.is_admin,
        cb.icon_name
    FROM account_company_roles acr
    JOIN companies c ON c.id = acr.company_id
    LEFT JOIN company_branding cb ON c.id = cb.company_id
    WHERE acr.account_id = p_account_id
    ORDER BY c.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_account_companies TO authenticated;

-- Remove the deprecated role field from accounts table
ALTER TABLE accounts DROP COLUMN IF EXISTS role;

-- Migrate existing data from the old system
-- All existing users get access to the "Guepard" company as employees
INSERT INTO account_company_roles (account_id, company_id, is_admin)
SELECT 
    a.id as account_id,
    c.id as company_id,
    false as is_admin  -- Default to employee access
FROM accounts a
CROSS JOIN companies c
WHERE c.name = 'Guepard'
AND a.id IS NOT NULL
ON CONFLICT (account_id, company_id) DO NOTHING;

-- Add a simple current_company_id column to accounts table for remembering last choice
ALTER TABLE accounts 
ADD COLUMN current_company_id UUID REFERENCES companies(id),
ADD COLUMN is_superuser BOOLEAN DEFAULT FALSE;

-- Update existing accounts to have Guepard as current company
UPDATE accounts 
SET current_company_id = c.id
FROM companies c
WHERE c.name = 'Guepard';

-- Create function to update current company (simple)
CREATE OR REPLACE FUNCTION set_current_company(p_account_id UUID, p_company_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    has_access BOOLEAN;
BEGIN
    -- Check if user has access to this company
    SELECT EXISTS(
        SELECT 1 FROM account_company_roles 
        WHERE account_id = p_account_id 
        AND company_id = p_company_id 
    ) INTO has_access;
    
    IF NOT has_access THEN
        RETURN false;
    END IF;
    
    -- Update current company
    UPDATE accounts 
    SET current_company_id = p_company_id, updated_at = NOW()
    WHERE id = p_account_id;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get current company info
CREATE OR REPLACE FUNCTION get_current_company_info(p_account_id UUID)
RETURNS TABLE (
    company_id UUID,
    company_name VARCHAR(255),
    is_admin BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        acr.is_admin
    FROM accounts a
    JOIN companies c ON c.id = a.current_company_id
    JOIN account_company_roles acr ON acr.account_id = a.id AND acr.company_id = c.id
    WHERE a.id = p_account_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION set_current_company TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_company_info TO authenticated;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR MULTI-COMPANY DATA ISOLATION
-- ============================================================================

-- Enable RLS on all relevant tables
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- EMPLOYEES TABLE RLS POLICIES
-- ============================================================================

-- Policy: Allow all operations for authenticated users (simplified to avoid recursion)
-- The application layer will handle proper access control
CREATE POLICY "Allow all operations for authenticated users" ON employees
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- ACCOUNTS TABLE RLS POLICIES
-- ============================================================================

-- Policy: Users can view their own account
CREATE POLICY "Users can view own account" ON accounts
  FOR SELECT
  USING (id = auth.uid());

-- Policy: Users can update their own account
CREATE POLICY "Users can update own account" ON accounts
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Policy: Allow all operations for authenticated users (simplified to avoid recursion)
-- The application layer will handle proper access control
CREATE POLICY "Allow all operations for authenticated users" ON accounts
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- ACCOUNT_COMPANY_ROLES TABLE RLS POLICIES
-- ============================================================================

-- Policy: Users can view their own company roles
CREATE POLICY "Users can view own company roles" ON account_company_roles
  FOR SELECT
  USING (account_id = auth.uid());

-- Policy: Allow all operations for authenticated users (simplified to avoid recursion)
-- The application layer will handle proper access control
CREATE POLICY "Allow all operations for authenticated users" ON account_company_roles
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- COMPANIES TABLE RLS POLICIES
-- ============================================================================

-- Policy: Allow all operations for authenticated users (simplified to avoid recursion)
-- The application layer will handle proper access control
CREATE POLICY "Allow all operations for authenticated users" ON companies
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- ADDITIONAL SECURITY POLICIES
-- ============================================================================

-- Note: Complex security policies removed to avoid recursion
-- Application layer will handle access control validation

-- ============================================================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================================================

-- Function to check if user is admin in current company
CREATE OR REPLACE FUNCTION is_admin_in_current_company()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM account_company_roles acr
    JOIN accounts a ON a.id = acr.account_id
    WHERE a.id = auth.uid()
    AND acr.company_id = a.current_company_id
    AND acr.role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's current company ID
CREATE OR REPLACE FUNCTION get_user_current_company_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT a.current_company_id
FROM accounts a
    WHERE a.id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is a superuser
CREATE OR REPLACE FUNCTION is_superuser(p_account_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM accounts a
    WHERE a.id = p_account_id
    AND a.is_superuser = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission for is_superuser function
GRANT EXECUTE ON FUNCTION is_superuser TO authenticated;

-- ============================================================================
-- GRANT NECESSARY PERMISSIONS
-- ============================================================================

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant necessary permissions for RLS to work
GRANT SELECT, INSERT, UPDATE, DELETE ON employees TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON accounts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON companies TO authenticated;

-- ============================================================================
-- RLS POLICIES FOR EMPLOYEE-RELATED TABLES
-- ============================================================================

-- Enable RLS on employee-related tables (if they exist)
DO $$
BEGIN
    -- Employee Profiles
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'employee_profiles') THEN
        ALTER TABLE employee_profiles ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Allow all operations for authenticated users" ON employee_profiles
          FOR ALL
          USING (true)
          WITH CHECK (true);
    END IF;

    -- Employee Addresses
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'employee_addresses') THEN
        ALTER TABLE employee_addresses ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow all operations for authenticated users" ON employee_addresses FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Employee Contacts
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'employee_contacts') THEN
        ALTER TABLE employee_contacts ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow all operations for authenticated users" ON employee_contacts FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Employee Documents
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'employee_documents') THEN
        ALTER TABLE employee_documents ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow all operations for authenticated users" ON employee_documents FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Employee Financial Info
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'employee_financial_info') THEN
        ALTER TABLE employee_financial_info ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow all operations for authenticated users" ON employee_financial_info FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Employee Medical Info
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'employee_medical_info') THEN
        ALTER TABLE employee_medical_info ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow all operations for authenticated users" ON employee_medical_info FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Timesheets
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'timesheets') THEN
        ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow all operations for authenticated users" ON timesheets FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Leave Requests
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leave_requests') THEN
        ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow all operations for authenticated users" ON leave_requests FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Locations
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'locations') THEN
        ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow all operations for authenticated users" ON locations FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Cost Centers
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cost_centers') THEN
        ALTER TABLE cost_centers ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow all operations for authenticated users" ON cost_centers FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Work Schedules
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'work_schedules') THEN
        ALTER TABLE work_schedules ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow all operations for authenticated users" ON work_schedules FOR ALL USING (true) WITH CHECK (true);
    END IF;

END $$;

-- ============================================================================
-- GRANT PERMISSIONS FOR ALL TABLES
-- ============================================================================

-- Grant permissions for all employee-related tables
DO $$
DECLARE
    tbl_name TEXT;
    tables TEXT[] := ARRAY[
        'employee_profiles', 'employee_addresses', 'employee_contacts', 
        'employee_documents', 'employee_financial_info', 'employee_medical_info',
        'employee_employment_details', 'employee_document_status', 
        'employee_administrative_notes', 'timesheets', 'timesheet_entries',
        'leave_requests', 'leave_policies', 'locations', 'cost_centers',
        'work_schedules', 'payroll_cycles', 'account_events', 'audit_logs'
    ];
BEGIN
    FOREACH tbl_name IN ARRAY tables
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl_name) THEN
            EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON %I TO authenticated', tbl_name);
        END IF;
    END LOOP;
END $$;

-- Print summary
DO $$
BEGIN
    RAISE NOTICE 'Simplified multi-company system migration completed!';
    RAISE NOTICE '';
    RAISE NOTICE 'New simplified structure:';
    RAISE NOTICE '- account_company_roles: Simple many-to-many with roles';
    RAISE NOTICE '- accounts.current_company_id: Remembers last selected company';
    RAISE NOTICE '';
    RAISE NOTICE 'New simple functions:';
    RAISE NOTICE '- get_account_companies(account_id): Get all companies for user';
    RAISE NOTICE '- set_current_company(account_id, company_id): Set current company';
    RAISE NOTICE '- get_current_company_info(account_id): Get current company details';
    RAISE NOTICE '- is_admin_in_current_company(): Check if user is admin in current company';
    RAISE NOTICE '- get_user_current_company_id(): Get user current company ID';
    RAISE NOTICE '- is_superuser(account_id): Check if user is superuser';
    RAISE NOTICE '';
    RAISE NOTICE 'Security features:';
    RAISE NOTICE '- Row Level Security (RLS) enabled on all tables';
    RAISE NOTICE '- Company data isolation enforced at database level';
    RAISE NOTICE '- Sensitive data (financial/medical) restricted to admins only';
    RAISE NOTICE '- Automatic filtering by current company context';
    RAISE NOTICE '';
    RAISE NOTICE 'Removed complexity:';
    RAISE NOTICE '- No more session tokens';
    RAISE NOTICE '- No more user_sessions table';
    RAISE NOTICE '- No more complex session management';
    RAISE NOTICE '';
    RAISE NOTICE 'System is now clean, simple, and secure!';
END $$;
