-- Seed data for HR system
-- This file populates the database with initial test data
-- Company structure and employees are created, accounts will be created by triggers when users sign up
--
-- IMPORTANT WORKFLOW:
-- 1. This seed creates company structure and employees WITHOUT accounts
-- 2. When users sign up via the app, triggers automatically create accounts
-- 3. Triggers automatically link employees to accounts by matching email
-- 4. No signup flow - it's invitation-based system

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

-- 5. Create Employees WITHOUT accounts (accounts will be created by create-test-users.js script)
INSERT INTO employees (
  company_id, first_name, last_name, email, 
  hire_date, employment_type, position_title, location_id, 
  cost_center_id, work_schedule_id, base_salary, salary_period, status
)
SELECT 
  c.id, 'Ahmed', 'Ben Ali', 'admin@guepard.run',
  '2023-01-15'::date, 'FULL_TIME'::employment_type, 'CEO & Founder', 
  (SELECT id FROM locations WHERE name = 'Tunis' AND company_id = c.id),
  (SELECT id FROM cost_centers WHERE code = 'HR' AND company_id = c.id),
  (SELECT id FROM work_schedules WHERE name = 'Full Time (40h)' AND company_id = c.id),
  15000, 'MONTHLY'::salary_period, 'ACTIVE'::employee_status
FROM companies c
WHERE c.name = 'Guepard'

UNION ALL

SELECT 
  c.id, 'Fatma', 'Trabelsi', 'hr@guepard.run',
  '2023-02-01'::date, 'FULL_TIME'::employment_type, 'HR Manager',
  (SELECT id FROM locations WHERE name = 'Tunis' AND company_id = c.id),
  (SELECT id FROM cost_centers WHERE code = 'HR' AND company_id = c.id),
  (SELECT id FROM work_schedules WHERE name = 'Full Time (40h)' AND company_id = c.id),
  8000, 'MONTHLY'::salary_period, 'ACTIVE'::employee_status
FROM companies c
WHERE c.name = 'Guepard'

UNION ALL

SELECT 
  c.id, 'Mohamed', 'Karray', 'manager@guepard.run',
  '2023-03-01'::date, 'FULL_TIME'::employment_type, 'Engineering Manager',
  (SELECT id FROM locations WHERE name = 'Tunis' AND company_id = c.id),
  (SELECT id FROM cost_centers WHERE code = 'ENG' AND company_id = c.id),
  (SELECT id FROM work_schedules WHERE name = 'Full Time (40h)' AND company_id = c.id),
  12000, 'MONTHLY'::salary_period, 'ACTIVE'::employee_status
FROM companies c
WHERE c.name = 'Guepard'

UNION ALL

SELECT 
  c.id, 'Sara', 'Mansouri', 'employee@guepard.run',
  '2024-04-01'::date, 'FULL_TIME'::employment_type, 'Software Developer',
  (SELECT id FROM locations WHERE name = 'Sfax' AND company_id = c.id),
  (SELECT id FROM cost_centers WHERE code = 'ENG' AND company_id = c.id),
  (SELECT id FROM work_schedules WHERE name = 'Full Time (40h)' AND company_id = c.id),
  6000, 'MONTHLY'::salary_period, 'ACTIVE'::employee_status
FROM companies c
WHERE c.name = 'Guepard';

-- 6. Update employee manager relationships
-- Fatma (HR Manager) reports to Ahmed (CEO)
UPDATE employees 
SET manager_id = (SELECT id FROM employees WHERE email = 'admin@guepard.run')
WHERE email = 'hr@guepard.run';

-- Mohamed (Engineering Manager) reports to Ahmed (CEO)
UPDATE employees 
SET manager_id = (SELECT id FROM employees WHERE email = 'admin@guepard.run')
WHERE email = 'manager@guepard.run';

-- Sara (Software Developer) reports to Mohamed (Engineering Manager)
UPDATE employees 
SET manager_id = (SELECT id FROM employees WHERE email = 'manager@guepard.run')
WHERE email = 'employee@guepard.run';

-- 7. Create Leave Policies
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

-- 8. Create Sample Payroll Cycles
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

-- Print summary
DO $$
BEGIN
  RAISE NOTICE 'Seed completed successfully!';
  RAISE NOTICE 'Company: Guepard';
  RAISE NOTICE 'Employees: 4 employees created WITHOUT accounts';
  RAISE NOTICE 'Company structure: Complete with locations, cost centers, work schedules';
  RAISE NOTICE '';
  RAISE NOTICE 'Employees Created:';
  RAISE NOTICE 'Ahmed: admin@guepard.run - CEO & Founder';
  RAISE NOTICE 'Fatma: hr@guepard.run - HR Manager';
  RAISE NOTICE 'Mohamed: manager@guepard.run - Engineering Manager';
  RAISE NOTICE 'Sara: employee@guepard.run - Software Developer';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '1. Run create-test-users.js to create auth users with simplified roles';
  RAISE NOTICE '2. Script will create accounts with ADMIN/EMPLOYEE roles and link employees';
  RAISE NOTICE '3. Users can then login and access the system based on their role';
  RAISE NOTICE '';
  RAISE NOTICE 'Role Assignment:';
  RAISE NOTICE 'CEO (Ahmed) → ADMIN role';
  RAISE NOTICE 'HR Manager (Fatma) → ADMIN role';
  RAISE NOTICE 'Engineering Manager (Mohamed) → EMPLOYEE role';
  RAISE NOTICE 'Software Developer (Sara) → EMPLOYEE role';
END $$;
