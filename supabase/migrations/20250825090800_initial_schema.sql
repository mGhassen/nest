-- Complete HR System Database Schema
-- This migration creates all necessary tables with improved structure and Supabase auth integration
-- Includes both local development and production-ready configurations
--
-- MANUAL ACCOUNT CREATION SYSTEM:
-- 1. No triggers - manual control over account creation
-- 2. When testing, use create-test-users.js script to:
--    - Create auth users
--    - Manually create accounts
--    - Manually link employees
-- 3. Clean, predictable, no permission issues
--
-- SYSTEM BEHAVIOR:
-- After running this migration:
-- 1. The accounts table will be EMPTY (no accounts created during migration)
-- 2. No triggers are created - manual control only
-- 3. When testing, manually create accounts and link employees
-- 4. Clean separation between authentication (auth.users), user accounts (accounts),
--    and employee records (employees) while maintaining proper relationships.

-- Create custom types
CREATE TYPE user_role AS ENUM ('OWNER', 'HR', 'MANAGER', 'EMPLOYEE');
CREATE TYPE employment_type AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACTOR', 'INTERN');
CREATE TYPE salary_period AS ENUM ('HOURLY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'YEARLY');
CREATE TYPE employee_status AS ENUM ('ACTIVE', 'INACTIVE', 'TERMINATED', 'ON_LEAVE');
CREATE TYPE timesheet_status AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED');
CREATE TYPE leave_request_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
CREATE TYPE payroll_status AS ENUM ('DRAFT', 'UPLOADED', 'APPROVED', 'PROCESSED');

-- Create companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    country_code VARCHAR(3) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create locations table
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    timezone VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cost_centers table
CREATE TABLE cost_centers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    code VARCHAR(10) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, code)
);

-- Create work_schedules table
CREATE TABLE work_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    weekly_hours INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create accounts table (linked to Supabase auth)
-- This table contains user authentication and role information
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'EMPLOYEE',
    profile_image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_account_role CHECK (role IN ('OWNER', 'HR', 'MANAGER', 'EMPLOYEE'))
);

-- Add comment explaining the purpose
COMMENT ON TABLE accounts IS 'User accounts table for authentication and role management';
COMMENT ON COLUMN accounts.id IS 'Local primary key for development and internal references';
COMMENT ON COLUMN accounts.auth_user_id IS 'Reference to Supabase auth.users(id) for production authentication';
COMMENT ON COLUMN accounts.role IS 'User role for access control and permissions';

-- Create employees table with company_id (main business entity)
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    hire_date DATE NOT NULL,
    employment_type employment_type NOT NULL,
    position_title VARCHAR(255) NOT NULL,
    location_id UUID REFERENCES locations(id),
    cost_center_id UUID REFERENCES cost_centers(id),
    work_schedule_id UUID REFERENCES work_schedules(id),
    manager_id UUID REFERENCES employees(id),
    base_salary DECIMAL(10,2) NOT NULL,
    salary_period salary_period NOT NULL,
    status employee_status DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: Removed unique constraint on account_id since employees are primary entities
-- and accounts can be null. This allows flexibility in the linking process.

-- Add comment explaining the optional account_id
COMMENT ON COLUMN employees.account_id IS 'Optional reference to accounts table. Can be null for employees without user accounts yet.';

-- Add comment explaining the role system
COMMENT ON TABLE employees IS 'Employee business records with optional user account linking. Role is managed in accounts table for access control and permissions.';
COMMENT ON COLUMN accounts.role IS 'User role for access control and permissions (OWNER, HR, MANAGER, EMPLOYEE)';

-- Create leave_policies table
CREATE TABLE leave_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    accrual_rule JSONB NOT NULL,
    unit VARCHAR(10) NOT NULL,
    carry_over_max INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, code)
);

-- Create payroll_cycles table
CREATE TABLE payroll_cycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    document_url TEXT,
    notes TEXT,
    status payroll_status DEFAULT 'DRAFT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, month, year)
);

-- Create timesheets table
CREATE TABLE timesheets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    status timesheet_status DEFAULT 'DRAFT',
    total_hours DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, week_start)
);

-- Create timesheet_entries table
CREATE TABLE timesheet_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timesheet_id UUID NOT NULL REFERENCES timesheets(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    project VARCHAR(255),
    hours DECIMAL(4,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leave_requests table
CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_policy_id UUID NOT NULL REFERENCES leave_policies(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_requested DECIMAL(4,2) NOT NULL,
    reason TEXT,
    status leave_request_status DEFAULT 'PENDING',
    approved_by UUID REFERENCES employees(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_logs table for system auditing
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    action VARCHAR(50) NOT NULL,
    actor_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    actor_email VARCHAR(255),
    old_values JSONB,
    new_values JSONB,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_locations_company_id ON locations(company_id);
CREATE INDEX idx_cost_centers_company_id ON cost_centers(company_id);
CREATE INDEX idx_work_schedules_company_id ON work_schedules(company_id);
CREATE INDEX idx_accounts_email ON accounts(email);
CREATE INDEX idx_accounts_is_active ON accounts(is_active);
CREATE INDEX idx_accounts_auth_user_id ON accounts(auth_user_id);
CREATE INDEX idx_accounts_role ON accounts(role);
CREATE INDEX idx_employees_company_id ON employees(company_id);
CREATE INDEX idx_employees_account_id ON employees(account_id);
CREATE INDEX idx_employees_manager_id ON employees(manager_id);
CREATE INDEX idx_leave_policies_company_id ON leave_policies(company_id);
CREATE INDEX idx_payroll_cycles_company_id ON payroll_cycles(company_id);
CREATE INDEX idx_timesheets_employee_id ON timesheets(employee_id);
CREATE INDEX idx_timesheets_week_start ON timesheets(week_start);
CREATE INDEX idx_timesheet_entries_timesheet_id ON timesheet_entries(timesheet_id);
CREATE INDEX idx_leave_requests_employee_id ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cost_centers_updated_at BEFORE UPDATE ON cost_centers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_work_schedules_updated_at BEFORE UPDATE ON work_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leave_policies_updated_at BEFORE UPDATE ON leave_policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payroll_cycles_updated_at BEFORE UPDATE ON payroll_cycles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_timesheets_updated_at BEFORE UPDATE ON timesheets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_timesheet_entries_updated_at BEFORE UPDATE ON timesheet_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON leave_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheet_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for accounts table
-- Simple policies that avoid recursion
CREATE POLICY "Users can view their own account" ON accounts
    FOR SELECT USING (
        auth.uid() = auth_user_id
    );

CREATE POLICY "Users can update their own account" ON accounts
    FOR UPDATE USING (
        auth.uid() = auth_user_id
    );

CREATE POLICY "Allow account creation for new users" ON accounts
    FOR INSERT WITH CHECK (
        -- Allow manual account creation during setup
        true
    );

-- For now, use simple policies to avoid recursion issues
-- Role-based policies can be added later after testing

-- Create RLS policies for other tables
CREATE POLICY "Allow all operations for testing" ON employees
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for testing" ON companies
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for testing" ON locations
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for testing" ON cost_centers
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for testing" ON work_schedules
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for testing" ON leave_policies
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for testing" ON payroll_cycles
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for testing" ON timesheets
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for testing" ON timesheet_entries
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for testing" ON leave_requests
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for testing" ON audit_logs
    FOR ALL USING (true);

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.companies TO authenticated;
GRANT ALL ON public.locations TO authenticated;
GRANT ALL ON public.cost_centers TO authenticated;
GRANT ALL ON public.work_schedules TO authenticated;
GRANT ALL ON public.accounts TO authenticated;
GRANT ALL ON public.employees TO authenticated;
GRANT ALL ON public.leave_policies TO authenticated;
GRANT ALL ON public.payroll_cycles TO authenticated;
GRANT ALL ON public.timesheets TO authenticated;
GRANT ALL ON public.timesheet_entries TO authenticated;
GRANT ALL ON public.leave_requests TO authenticated;
GRANT ALL ON public.audit_logs TO authenticated;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant necessary permissions to anon role for testing
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.companies TO anon;
GRANT INSERT ON public.accounts TO anon;
GRANT INSERT ON public.employees TO anon;
GRANT SELECT, UPDATE ON public.employees TO anon;

-- We remove all default privileges from public schema on functions to
--   prevent public access to them
alter default privileges
revoke
execute on functions
from
  public;

revoke all on schema public
from
  public;

revoke all PRIVILEGES on database "postgres"
from
  "anon";

revoke all PRIVILEGES on schema "storage"
from
  "anon";

revoke all PRIVILEGES on all SEQUENCES in schema "storage"
from
  "anon";

revoke all PRIVILEGES on all FUNCTIONS in schema "storage"
from
  "anon";

revoke all PRIVILEGES on all TABLES in schema "storage"
from
  "anon";

-- We remove all default privileges from public schema on functions to
--   prevent public access to them by default
alter default privileges in schema public
revoke
execute on functions
from
  anon,
  authenticated;
