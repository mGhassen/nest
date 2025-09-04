-- Simplify Role System Migration
-- Replace user_role enum with simple is_admin boolean in account_company_roles
-- This makes the system cleaner: is_admin = true for admin portal access
-- Employee portal access is determined by existence in employees table with is_active = true

-- First, add the new is_admin column
ALTER TABLE account_company_roles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- Migrate existing data: set is_admin = true where role = 'ADMIN' (if role column exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'account_company_roles' 
               AND column_name = 'role') THEN
        UPDATE account_company_roles 
        SET is_admin = true 
        WHERE role = 'ADMIN';
    END IF;
END $$;

-- Add is_active column if it doesn't exist
ALTER TABLE account_company_roles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Add joined_at column if it doesn't exist
ALTER TABLE account_company_roles 
ADD COLUMN IF NOT EXISTS joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Drop the old role column
ALTER TABLE account_company_roles DROP COLUMN IF EXISTS role;

-- Update the get_account_companies function to use is_admin
DROP FUNCTION IF EXISTS get_account_companies(UUID);
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

-- Update the get_current_company_info function to use is_admin
DROP FUNCTION IF EXISTS get_current_company_info(UUID);
CREATE OR REPLACE FUNCTION get_current_company_info(p_account_id UUID)
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
    FROM accounts a
    JOIN account_company_roles acr ON acr.account_id = a.id
    JOIN companies c ON c.id = acr.company_id
    LEFT JOIN company_branding cb ON c.id = cb.company_id
    WHERE a.id = p_account_id 
    AND c.id = a.current_company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the set_current_company function to use is_admin
DROP FUNCTION IF EXISTS set_current_company(UUID, UUID);
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
    SET current_company_id = p_company_id 
    WHERE id = p_account_id;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_account_companies TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_company_info TO authenticated;
GRANT EXECUTE ON FUNCTION set_current_company TO authenticated;
