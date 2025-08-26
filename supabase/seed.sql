-- Seed data for HR system
-- This file populates the database with initial test data
-- Note: For local development, we'll create accounts without auth.users dependency

-- 1. Create Company
INSERT INTO companies (name, country_code, currency) VALUES 
('Guepard', 'TN', 'TND');

-- 2. Create Locations
INSERT INTO locations (company_id, name, country, timezone) 
SELECT id, 'Tunis', 'Tunisia', 'Africa/Tunis' FROM companies WHERE name = 'Guepard'
UNION ALL
SELECT id, 'Sfax', 'Tunisia', 'Africa/Tunis' FROM companies WHERE name = 'Guepard';

-- 3. Create Cost Centers
INSERT INTO cost_centers (company_id, code, name)
SELECT id, 'ENG', 'Engineering' FROM companies WHERE name = 'Guepard'
UNION ALL
SELECT id, 'SALES', 'Sales & Marketing' FROM companies WHERE name = 'Guepard'
UNION ALL
SELECT id, 'HR', 'Human Resources' FROM companies WHERE name = 'Guepard';

-- 4. Create Work Schedules
INSERT INTO work_schedules (company_id, name, weekly_hours)
SELECT id, 'Full Time (40h)', 40 FROM companies WHERE name = 'Guepard'
UNION ALL
SELECT id, 'Part Time (20h)', 20 FROM companies WHERE name = 'Guepard';

-- 5. Create test users in auth.users table for testing (if available)
-- These will simulate real Supabase auth users
DO $$
BEGIN
    -- Check if auth.users table exists and we can insert into it
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'auth' AND table_name = 'users'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.table_privileges 
        WHERE table_schema = 'auth' AND table_name = 'users' AND privilege_type = 'INSERT'
    ) THEN
        -- Insert test users into auth.users
        INSERT INTO auth.users (
            id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_user_meta_data
        ) VALUES
        (
            '550e8400-e29b-41d4-a716-446655440001',
            'admin@guepard.run',
            crypt('admin123', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"first_name": "Ahmed", "last_name": "Ben Ali"}'::jsonb
        ),
        (
            '550e8400-e29b-41d4-a716-446655440002',
            'hr@guepard.run',
            crypt('hr123', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"first_name": "Fatma", "last_name": "Trabelsi"}'::jsonb
        ),
        (
            '550e8400-e29b-41d4-a716-446655440003',
            'manager@guepard.run',
            crypt('manager123', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"first_name": "Mohamed", "last_name": "Karray"}'::jsonb
        ),
        (
            '550e8400-e29b-41d4-a716-446655440004',
            'employee@guepard.run',
            crypt('employee123', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"first_name": "Sara", "last_name": "Mansouri"}'::jsonb
        );
        
        RAISE NOTICE 'Test users created in auth.users table';
    ELSE
        RAISE NOTICE 'Skipping auth.users creation - table not available or no insert privileges';
    END IF;
END $$;

-- 6. Create Accounts (with or without auth users)
-- If auth.users exists, link to it; otherwise use NULL for auth_user_id
DO $$
BEGIN
    -- Check if we successfully created auth users
    IF EXISTS (
        SELECT 1 FROM auth.users 
        WHERE email = 'admin@guepard.run'
    ) THEN
        -- Check if accounts already exist (might have been created by trigger)
        IF NOT EXISTS (SELECT 1 FROM accounts WHERE email = 'admin@guepard.run') THEN
            -- Create accounts linked to auth users
            INSERT INTO accounts (id, auth_user_id, email, first_name, last_name, profile_image_url, role) VALUES
            ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'admin@guepard.run', 'Ahmed', 'Ben Ali', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 'OWNER'),
            ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'hr@guepard.run', 'Fatma', 'Trabelsi', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', 'HR'),
            ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'manager@guepard.run', 'Mohamed', 'Karray', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 'MANAGER'),
            ('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'employee@guepard.run', 'Sara', 'Mansouri', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', 'EMPLOYEE');
            
            RAISE NOTICE 'Accounts created with auth user links';
        ELSE
            -- Accounts already exist (created by trigger), just update them with our data
            UPDATE accounts SET 
                auth_user_id = '550e8400-e29b-41d4-a716-446655440001',
                first_name = 'Ahmed',
                last_name = 'Ben Ali',
                profile_image_url = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                role = 'OWNER'
            WHERE email = 'admin@guepard.run';
            
            UPDATE accounts SET 
                auth_user_id = '550e8400-e29b-41d4-a716-446655440002',
                first_name = 'Fatma',
                last_name = 'Trabelsi',
                profile_image_url = 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
                role = 'HR'
            WHERE email = 'hr@guepard.run';
            
            UPDATE accounts SET 
                auth_user_id = '550e8400-e29b-41d4-a716-446655440003',
                first_name = 'Mohamed',
                last_name = 'Karray',
                profile_image_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
                role = 'MANAGER'
            WHERE email = 'manager@guepard.run';
            
            UPDATE accounts SET 
                auth_user_id = '550e8400-e29b-41d4-a716-446655440004',
                first_name = 'Sara',
                last_name = 'Mansouri',
                profile_image_url = 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
                role = 'EMPLOYEE'
            WHERE email = 'employee@guepard.run';
            
            RAISE NOTICE 'Existing accounts updated with auth user links and profile data';
        END IF;
    ELSE
        -- Create accounts without auth user links (for local development)
        INSERT INTO accounts (id, auth_user_id, email, first_name, last_name, profile_image_url, role) VALUES
        ('550e8400-e29b-41d4-a716-446655440001', NULL, 'admin@guepard.run', 'Ahmed', 'Ben Ali', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 'OWNER'),
        ('550e8400-e29b-41d4-a716-446655440002', NULL, 'hr@guepard.run', 'Fatma', 'Trabelsi', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', 'HR'),
        ('550e8400-e29b-41d4-a716-446655440003', NULL, 'manager@guepard.run', 'Mohamed', 'Karray', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 'MANAGER'),
        ('550e8400-e29b-41d4-a716-446655440004', NULL, 'employee@guepard.run', 'Sara', 'Mansouri', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', 'EMPLOYEE');
        
        RAISE NOTICE 'Accounts created without auth user links (local development mode)';
    END IF;
END $$;

-- 7. Create Memberships (User-Company relationships with roles)
INSERT INTO memberships (user_id, company_id, role)
SELECT a.id, c.id, 'OWNER'::user_role FROM accounts a, companies c WHERE a.email = 'admin@guepard.run' AND c.name = 'Guepard'
UNION ALL
SELECT a.id, c.id, 'HR'::user_role FROM accounts a, companies c WHERE a.email = 'hr@guepard.run' AND c.name = 'Guepard'
UNION ALL
SELECT a.id, c.id, 'MANAGER'::user_role FROM accounts a, companies c WHERE a.email = 'manager@guepard.run' AND c.name = 'Guepard'
UNION ALL
SELECT a.id, c.id, 'EMPLOYEE'::user_role FROM accounts a, companies c WHERE a.email = 'employee@guepard.run' AND c.name = 'Guepard';

-- 8. Create Employees
INSERT INTO employees (
  company_id, user_id, first_name, last_name, email, 
  hire_date, employment_type, position_title, location_id, 
  cost_center_id, work_schedule_id, base_salary, salary_period, status
)
SELECT 
  c.id, a.id, a.first_name, a.last_name, a.email,
  '2023-01-15'::date, 'FULL_TIME'::employment_type, 'CEO & Founder', 
  (SELECT id FROM locations WHERE name = 'Tunis' AND company_id = c.id),
  (SELECT id FROM cost_centers WHERE code = 'HR' AND company_id = c.id),
  (SELECT id FROM work_schedules WHERE name = 'Full Time (40h)' AND company_id = c.id),
  15000, 'MONTHLY'::salary_period, 'ACTIVE'::employee_status
FROM accounts a, companies c 
WHERE a.email = 'admin@guepard.run' AND c.name = 'Guepard'

UNION ALL

SELECT 
  c.id, a.id, a.first_name, a.last_name, a.email,
  '2023-02-01'::date, 'FULL_TIME'::employment_type, 'HR Manager',
  (SELECT id FROM locations WHERE name = 'Tunis' AND company_id = c.id),
  (SELECT id FROM cost_centers WHERE code = 'HR' AND company_id = c.id),
  (SELECT id FROM work_schedules WHERE name = 'Full Time (40h)' AND company_id = c.id),
  8000, 'MONTHLY'::salary_period, 'ACTIVE'::employee_status
FROM accounts a, companies c 
WHERE a.email = 'hr@guepard.run' AND c.name = 'Guepard'

UNION ALL

SELECT 
  c.id, a.id, a.first_name, a.last_name, a.email,
  '2023-03-01'::date, 'FULL_TIME'::employment_type, 'Engineering Manager',
  (SELECT id FROM locations WHERE name = 'Tunis' AND company_id = c.id),
  (SELECT id FROM cost_centers WHERE code = 'ENG' AND company_id = c.id),
  (SELECT id FROM work_schedules WHERE name = 'Full Time (40h)' AND company_id = c.id),
  12000, 'MONTHLY'::salary_period, 'ACTIVE'::employee_status
FROM accounts a, companies c 
WHERE a.email = 'manager@guepard.run' AND c.name = 'Guepard'

UNION ALL

SELECT 
  c.id, a.id, a.first_name, a.last_name, a.email,
  '2023-04-01'::date, 'FULL_TIME'::employment_type, 'Software Developer',
  (SELECT id FROM locations WHERE name = 'Sfax' AND company_id = c.id),
  (SELECT id FROM cost_centers WHERE code = 'ENG' AND company_id = c.id),
  (SELECT id FROM work_schedules WHERE name = 'Full Time (40h)' AND company_id = c.id),
  6000, 'MONTHLY'::salary_period, 'ACTIVE'::employee_status
FROM accounts a, companies c 
WHERE a.email = 'employee@guepard.run' AND c.name = 'Guepard';

-- 9. Update employee manager relationship
UPDATE employees 
SET manager_id = (SELECT id FROM employees WHERE email = 'manager@guepard.run')
WHERE email = 'employee@guepard.run';

-- 10. Create Leave Policies
INSERT INTO leave_policies (company_id, code, name, accrual_rule, unit, carry_over_max)
SELECT 
  c.id, 'ANNUAL', 'Annual Leave', 
  '{"type": "MONTHLY", "daysPerMonth": 1.83, "maxCarryOver": 5}'::jsonb,
  'DAYS', 5
FROM companies c WHERE c.name = 'Guepard'

UNION ALL

SELECT 
  c.id, 'SICK', 'Sick Leave',
  '{"type": "UNLIMITED", "maxDaysPerYear": 30}'::jsonb,
  'DAYS', 0
FROM companies c WHERE c.name = 'Guepard';

-- 11. Create Sample Payroll Cycles
INSERT INTO payroll_cycles (company_id, month, year, document_url, notes, status)
SELECT 
  c.id, 
  EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '1 month'),
  EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '1 month'),
  'https://example.com/payroll-sample.pdf',
  'Sample payroll document',
  'APPROVED'::payroll_status
FROM companies c WHERE c.name = 'Guepard'

UNION ALL

SELECT 
  c.id, 
  EXTRACT(MONTH FROM CURRENT_DATE),
  EXTRACT(YEAR FROM CURRENT_DATE),
  'https://example.com/payroll-current.pdf',
  'Current month payroll',
  'UPLOADED'::payroll_status
FROM companies c WHERE c.name = 'Guepard';

-- 12. Create some sample timesheets
INSERT INTO timesheets (employee_id, week_start, status)
SELECT 
  e.id, 
  DATE_TRUNC('week', CURRENT_DATE - INTERVAL '1 week')::DATE,
  'APPROVED'::timesheet_status
FROM employees e 
WHERE e.email = 'employee@guepard.run'

UNION ALL

SELECT 
  e.id, 
  DATE_TRUNC('week', CURRENT_DATE)::DATE,
  'DRAFT'::timesheet_status
FROM employees e 
WHERE e.email = 'employee@guepard.run';

-- 13. Create sample timesheet entries
INSERT INTO timesheet_entries (timesheet_id, date, project, hours, notes)
SELECT 
  t.id,
  t.week_start + INTERVAL '0 days',
  'Main Project',
  8.0,
  'Regular work day'
FROM timesheets t 
WHERE t.status = 'APPROVED'

UNION ALL

SELECT 
  t.id,
  t.week_start + INTERVAL '1 days',
  'Main Project',
  8.0,
  'Regular work day'
FROM timesheets t 
WHERE t.status = 'APPROVED'

UNION ALL

SELECT 
  t.id,
  t.week_start + INTERVAL '2 days',
  'Main Project',
  8.0,
  'Regular work day'
FROM timesheets t 
WHERE t.status = 'APPROVED'

UNION ALL

SELECT 
  t.id,
  t.week_start + INTERVAL '3 days',
  'Main Project',
  8.0,
  'Regular work day'
FROM timesheets t 
WHERE t.status = 'APPROVED'

UNION ALL

SELECT 
  t.id,
  t.week_start + INTERVAL '4 days',
  'Main Project',
  8.0,
  'Regular work day'
FROM timesheets t 
WHERE t.status = 'APPROVED';

-- Print summary
DO $$
BEGIN
  RAISE NOTICE 'Seed completed successfully!';
  RAISE NOTICE 'Company: Guepard';
  
  -- Check if auth users were created
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@guepard.run') THEN
    RAISE NOTICE 'Auth Users: admin@guepard.run, hr@guepard.run, manager@guepard.run, employee@guepard.run';
    RAISE NOTICE 'Accounts: Linked to auth users with proper roles (OWNER, HR, MANAGER, EMPLOYEE)';
    RAISE NOTICE 'Test Credentials:';
    RAISE NOTICE 'Admin: admin@guepard.run / admin123';
    RAISE NOTICE 'HR: hr@guepard.run / hr123';
    RAISE NOTICE 'Manager: manager@guepard.run / manager123';
    RAISE NOTICE 'Employee: employee@guepard.run / employee123';
  ELSE
    RAISE NOTICE 'Accounts: Created without auth user links (local development mode)';
    RAISE NOTICE 'Note: Auth users not available - using local development setup';
  END IF;
  
  RAISE NOTICE 'Locations: Tunis, Sfax';
  RAISE NOTICE 'Cost Centers: Engineering, Sales & Marketing, HR';
  RAISE NOTICE 'Work Schedules: Full Time (40h), Part Time (20h)';
  RAISE NOTICE 'Leave Policies: Annual Leave, Sick Leave';
  RAISE NOTICE 'Sample data created for testing';
END $$;
