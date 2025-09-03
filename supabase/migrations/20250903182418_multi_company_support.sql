-- Simplified Multi-Company Management Support
-- This migration creates a simple many-to-many relationship between accounts and companies
-- Clean and simple: account -> company with role, no complex session tracking

-- Create simple account_company_roles table
-- This is the core many-to-many relationship: account -> company with role
CREATE TABLE account_company_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'EMPLOYEE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(account_id, company_id)
);

-- Add comments
COMMENT ON TABLE account_company_roles IS 'Simple many-to-many relationship: accounts can have roles in multiple companies';
COMMENT ON COLUMN account_company_roles.role IS 'User role within this specific company: ADMIN or EMPLOYEE';

-- Create indexes for performance
CREATE INDEX idx_account_company_roles_account_id ON account_company_roles(account_id);
CREATE INDEX idx_account_company_roles_company_id ON account_company_roles(company_id);
CREATE INDEX idx_account_company_roles_role ON account_company_roles(role);

-- Add updated_at trigger
CREATE TRIGGER update_account_company_roles_updated_at 
    BEFORE UPDATE ON account_company_roles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE account_company_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policy (allow all for now)
CREATE POLICY "Allow all operations for testing" ON account_company_roles FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON public.account_company_roles TO authenticated;
GRANT ALL ON public.account_company_roles TO anon;

-- Create simple functions
-- Get all companies for an account
CREATE OR REPLACE FUNCTION get_account_companies(p_account_id UUID)
RETURNS TABLE (
    company_id UUID,
    company_name VARCHAR(255),
    role user_role
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        acr.role
    FROM account_company_roles acr
    JOIN companies c ON c.id = acr.company_id
    WHERE acr.account_id = p_account_id
    ORDER BY c.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_account_companies TO authenticated;

-- Remove the deprecated role field from accounts table
ALTER TABLE accounts DROP COLUMN IF EXISTS role;

-- Migrate existing data from the old system
-- All existing users get roles in the "Guepard" company
INSERT INTO account_company_roles (account_id, company_id, role)
SELECT 
    a.id as account_id,
    c.id as company_id,
    'EMPLOYEE' as role  -- Default role since we removed the role field
FROM accounts a
CROSS JOIN companies c
WHERE c.name = 'Guepard'
AND a.id IS NOT NULL
ON CONFLICT (account_id, company_id) DO NOTHING;

-- Add a simple current_company_id column to accounts table for remembering last choice
ALTER TABLE accounts ADD COLUMN current_company_id UUID REFERENCES companies(id);

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
    role user_role
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        acr.role
    FROM accounts a
    JOIN companies c ON c.id = a.current_company_id
    JOIN account_company_roles acr ON acr.account_id = a.id AND acr.company_id = c.id
    WHERE a.id = p_account_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION set_current_company TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_company_info TO authenticated;

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
    RAISE NOTICE '';
    RAISE NOTICE 'Removed complexity:';
    RAISE NOTICE '- No more session tokens';
    RAISE NOTICE '- No more user_sessions table';
    RAISE NOTICE '- No more complex session management';
    RAISE NOTICE '';
    RAISE NOTICE 'System is now clean and simple!';
END $$;
