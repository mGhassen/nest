-- Seed data for HR system
-- This file populates the database with initial test data

-- 1. Create Company
INSERT INTO companies (name, country_code, currency) VALUES 
('TechCorp Solutions', 'TN', 'TND');

-- 2. Create Locations
INSERT INTO locations (company_id, name, country_code, timezone) 
SELECT id, 'Tunis', 'TN', 'Africa/Tunis' FROM companies WHERE name = 'TechCorp Solutions'
UNION ALL
SELECT id, 'Sfax', 'TN', 'Africa/Tunis' FROM companies WHERE name = 'TechCorp Solutions';

-- 3. Create Cost Centers
INSERT INTO cost_centers (company_id, code, name)
SELECT id, 'ENG', 'Engineering' FROM companies WHERE name = 'TechCorp Solutions'
UNION ALL
SELECT id, 'SALES', 'Sales & Marketing' FROM companies WHERE name = 'TechCorp Solutions'
UNION ALL
SELECT id, 'HR', 'Human Resources' FROM companies WHERE name = 'TechCorp Solutions';

-- 4. Create Work Schedules
INSERT INTO work_schedules (company_id, name, weekly_hours)
SELECT id, 'Full Time (40h)', 40 FROM companies WHERE name = 'TechCorp Solutions'
UNION ALL
SELECT id, 'Part Time (20h)', 20 FROM companies WHERE name = 'TechCorp Solutions';

-- 5. Create Users (these will be linked to Supabase auth users)
INSERT INTO users (id, email, first_name, last_name, profile_image_url) VALUES
('admin-user-001', 'admin@techcorp.tn', 'Ahmed', 'Ben Ali', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'),
('hr-user-001', 'hr@techcorp.tn', 'Fatma', 'Trabelsi', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'),
('manager-user-001', 'manager@techcorp.tn', 'Mohamed', 'Karray', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'),
('employee-user-001', 'employee@techcorp.tn', 'Sara', 'Mansouri', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face');

-- 6. Create Memberships (User-Company relationships with roles)
INSERT INTO memberships (user_id, company_id, role)
SELECT u.id, c.id, 'OWNER' FROM users u, companies c WHERE u.email = 'admin@techcorp.tn' AND c.name = 'TechCorp Solutions'
UNION ALL
SELECT u.id, c.id, 'HR' FROM users u, companies c WHERE u.email = 'hr@techcorp.tn' AND c.name = 'TechCorp Solutions'
UNION ALL
SELECT u.id, c.id, 'MANAGER' FROM users u, companies c WHERE u.email = 'manager@techcorp.tn' AND c.name = 'TechCorp Solutions'
UNION ALL
SELECT u.id, c.id, 'EMPLOYEE' FROM users u, companies c WHERE u.email = 'employee@techcorp.tn' AND c.name = 'TechCorp Solutions';

-- 7. Create Employees
INSERT INTO employees (
  company_id, user_id, first_name, last_name, email, 
  hire_date, employment_type, position_title, location_id, 
  cost_center_id, work_schedule_id, base_salary, salary_period, status
)
SELECT 
  c.id, u.id, u.first_name, u.last_name, u.email,
  '2023-01-15', 'FULL_TIME', 'CEO & Founder', 
  (SELECT id FROM locations WHERE name = 'Tunis' AND company_id = c.id),
  (SELECT id FROM cost_centers WHERE code = 'HR' AND company_id = c.id),
  (SELECT id FROM work_schedules WHERE name = 'Full Time (40h)' AND company_id = c.id),
  15000, 'MONTHLY', 'ACTIVE'
FROM users u, companies c 
WHERE u.email = 'admin@techcorp.tn' AND c.name = 'TechCorp Solutions'

UNION ALL

SELECT 
  c.id, u.id, u.first_name, u.last_name, u.email,
  '2023-02-01', 'FULL_TIME', 'HR Manager',
  (SELECT id FROM locations WHERE name = 'Tunis' AND company_id = c.id),
  (SELECT id FROM cost_centers WHERE code = 'HR' AND company_id = c.id),
  (SELECT id FROM work_schedules WHERE name = 'Full Time (40h)' AND company_id = c.id),
  8000, 'MONTHLY', 'ACTIVE'
FROM users u, companies c 
WHERE u.email = 'hr@techcorp.tn' AND c.name = 'TechCorp Solutions'

UNION ALL

SELECT 
  c.id, u.id, u.first_name, u.last_name, u.email,
  '2023-03-01', 'FULL_TIME', 'Engineering Manager',
  (SELECT id FROM locations WHERE name = 'Tunis' AND company_id = c.id),
  (SELECT id FROM cost_centers WHERE code = 'ENG' AND company_id = c.id),
  (SELECT id FROM work_schedules WHERE name = 'Full Time (40h)' AND company_id = c.id),
  12000, 'MONTHLY', 'ACTIVE'
FROM users u, companies c 
WHERE u.email = 'manager@techcorp.tn' AND c.name = 'TechCorp Solutions'

UNION ALL

SELECT 
  c.id, u.id, u.first_name, u.last_name, u.email,
  '2023-04-01', 'FULL_TIME', 'Software Developer',
  (SELECT id FROM locations WHERE name = 'Sfax' AND company_id = c.id),
  (SELECT id FROM cost_centers WHERE code = 'ENG' AND company_id = c.id),
  (SELECT id FROM work_schedules WHERE name = 'Full Time (40h)' AND company_id = c.id),
  6000, 'MONTHLY', 'ACTIVE'
FROM users u, companies c 
WHERE u.email = 'employee@techcorp.tn' AND c.name = 'TechCorp Solutions';

-- 8. Update employee manager relationship
UPDATE employees 
SET manager_id = (SELECT id FROM employees WHERE email = 'manager@techcorp.tn')
WHERE email = 'employee@techcorp.tn';

-- 9. Create Leave Policies
INSERT INTO leave_policies (company_id, code, name, accrual_rule, unit, carry_over_max)
SELECT 
  c.id, 'ANNUAL', 'Annual Leave', 
  '{"type": "MONTHLY", "daysPerMonth": 1.83, "maxCarryOver": 5}',
  'DAYS', 5
FROM companies c WHERE c.name = 'TechCorp Solutions'

UNION ALL

SELECT 
  c.id, 'SICK', 'Sick Leave',
  '{"type": "UNLIMITED", "maxDaysPerYear": 30}',
  'DAYS', 0
FROM companies c WHERE c.name = 'TechCorp Solutions';

-- 10. Create Sample Payroll Cycles
INSERT INTO payroll_cycles (company_id, month, year, document_url, notes, status)
SELECT 
  c.id, 
  EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '1 month'),
  EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '1 month'),
  'https://example.com/payroll-sample.pdf',
  'Sample payroll document',
  'APPROVED'
FROM companies c WHERE c.name = 'TechCorp Solutions'

UNION ALL

SELECT 
  c.id, 
  EXTRACT(MONTH FROM CURRENT_DATE),
  EXTRACT(YEAR FROM CURRENT_DATE),
  'https://example.com/payroll-current.pdf',
  'Current month payroll',
  'UPLOADED'
FROM companies c WHERE c.name = 'TechCorp Solutions';

-- 11. Create some sample timesheets
INSERT INTO timesheets (employee_id, week_start, status)
SELECT 
  e.id, 
  DATE_TRUNC('week', CURRENT_DATE - INTERVAL '1 week')::DATE,
  'APPROVED'
FROM employees e 
WHERE e.email = 'employee@techcorp.tn'

UNION ALL

SELECT 
  e.id, 
  DATE_TRUNC('week', CURRENT_DATE)::DATE,
  'DRAFT'
FROM employees e 
WHERE e.email = 'employee@techcorp.tn';

-- 12. Create sample timesheet entries
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
  RAISE NOTICE 'Company: TechCorp Solutions';
  RAISE NOTICE 'Users: admin@techcorp.tn (OWNER), hr@techcorp.tn (HR), manager@techcorp.tn (MANAGER), employee@techcorp.tn (EMPLOYEE)';
  RAISE NOTICE 'Locations: Tunis, Sfax';
  RAISE NOTICE 'Cost Centers: Engineering, Sales & Marketing, HR';
  RAISE NOTICE 'Work Schedules: Full Time (40h), Part Time (20h)';
  RAISE NOTICE 'Leave Policies: Annual Leave, Sick Leave';
  RAISE NOTICE 'Sample data created for testing';
END $$;
