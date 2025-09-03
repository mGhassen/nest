-- Seed data for HR system
-- This file populates the database with initial test data
-- Company structure and employees are created, accounts will be created by triggers when users sign up
--
-- IMPORTANT WORKFLOW:
-- 1. This seed creates company structure and employees WITHOUT accounts
-- 2. When users sign up via the app, triggers automatically create accounts
-- 3. Triggers automatically link employees to accounts by matching email
-- 4. No signup flow - it's invitation-based system

-- 1. Create Companies (Core information only)
INSERT INTO companies (
    name, country_code, currency, status, is_verified
) VALUES 
(
    'Guepard', 
    'TN', 
    'TND',
    'ACTIVE',
    TRUE
),
(
    'TechCorp', 
    'US', 
    'USD',
    'ACTIVE',
    TRUE
),
(
    'InnovateLab', 
    'FR', 
    'EUR',
    'ACTIVE',
    TRUE
);

-- 2. Create Company Profiles (Business information)
INSERT INTO company_profiles (
    company_id, legal_name, description, industry, company_size, founded_year,
    business_type, legal_structure, tax_id
)
SELECT 
    c.id, 
    'Guepard Technologies SARL',
    'Leading technology company specializing in innovative software solutions and digital transformation services.',
    'Technology',
    '51-200',
    2018,
    'Technology Services',
    'SARL',
    'TN123456789'
FROM companies c WHERE c.name = 'Guepard'

UNION ALL

SELECT 
    c.id, 
    'TechCorp Solutions Inc.',
    'Global technology corporation providing cutting-edge software solutions and enterprise services.',
    'Technology',
    '1001-5000',
    2015,
    'Software Development',
    'Corporation',
    'US123456789'
FROM companies c WHERE c.name = 'TechCorp'

UNION ALL

SELECT 
    c.id, 
    'InnovateLab SAS',
    'French innovation laboratory focused on research and development of next-generation technologies.',
    'Research & Development',
    '11-50',
    2020,
    'Research & Development',
    'SAS',
    'FR12345678901'
FROM companies c WHERE c.name = 'InnovateLab';

-- 3. Create Company Addresses (Location data)
INSERT INTO company_addresses (
    company_id, address_type, address, city, state, country, postal_code, timezone, is_primary
)
SELECT 
    c.id, 'HEADQUARTERS', '123 Avenue Habib Bourguiba', 'Tunis', 'Tunis', 'Tunisia', '1000', 'Africa/Tunis', TRUE
FROM companies c WHERE c.name = 'Guepard'

UNION ALL

SELECT 
    c.id, 'HEADQUARTERS', '456 Silicon Valley Blvd', 'San Francisco', 'California', 'United States', '94105', 'America/Los_Angeles', TRUE
FROM companies c WHERE c.name = 'TechCorp'

UNION ALL

SELECT 
    c.id, 'HEADQUARTERS', '789 Rue de la Innovation', 'Paris', 'Île-de-France', 'France', '75001', 'Europe/Paris', TRUE
FROM companies c WHERE c.name = 'InnovateLab';

-- 4. Create Company Contacts (Contact information)
INSERT INTO company_contacts (
    company_id, contact_type, website, email, phone, is_primary
)
SELECT 
    c.id, 'GENERAL', 'https://guepard.run', 'contact@guepard.run', '+216 71 123 456', TRUE
FROM companies c WHERE c.name = 'Guepard'

UNION ALL

SELECT 
    c.id, 'GENERAL', 'https://techcorp.com', 'info@techcorp.com', '+1 555 123 4567', TRUE
FROM companies c WHERE c.name = 'TechCorp'

UNION ALL

SELECT 
    c.id, 'GENERAL', 'https://innovatelab.fr', 'contact@innovatelab.fr', '+33 1 23 45 67 89', TRUE
FROM companies c WHERE c.name = 'InnovateLab';

-- 5. Create Company Branding (Visual identity)
INSERT INTO company_branding (
    company_id, brand_color, secondary_color, icon_name
)
SELECT 
    c.id, '#2563EB', '#1E40AF', 'Building2'
FROM companies c WHERE c.name = 'Guepard'

UNION ALL

SELECT 
    c.id, '#059669', '#047857', 'Users'
FROM companies c WHERE c.name = 'TechCorp'

UNION ALL

SELECT 
    c.id, '#DC2626', '#B91C1C', 'Lightbulb'
FROM companies c WHERE c.name = 'InnovateLab';

-- 6. Create Company Social (Social media links)
INSERT INTO company_social (
    company_id, linkedin_url, twitter_url, facebook_url
)
SELECT 
    c.id, 
    'https://linkedin.com/company/guepard-tech',
    'https://twitter.com/guepard_tech',
    'https://facebook.com/guepard.tech'
FROM companies c WHERE c.name = 'Guepard'

UNION ALL

SELECT 
    c.id, 
    'https://linkedin.com/company/techcorp-solutions',
    'https://twitter.com/techcorp_sol',
    'https://facebook.com/techcorp.solutions'
FROM companies c WHERE c.name = 'TechCorp'

UNION ALL

SELECT 
    c.id, 
    'https://linkedin.com/company/innovatelab-fr',
    'https://twitter.com/innovatelab_fr',
    'https://facebook.com/innovatelab.fr'
FROM companies c WHERE c.name = 'InnovateLab';

-- 2. Create Locations
INSERT INTO locations (company_id, name, country, timezone) 
-- Guepard locations
SELECT id, 'Tunis', 'Tunisia', 'Africa/Tunis' FROM companies WHERE name = 'Guepard'
UNION ALL
SELECT id, 'Sfax', 'Tunisia', 'Africa/Tunis' FROM companies WHERE name = 'Guepard'
-- TechCorp locations
UNION ALL
SELECT id, 'San Francisco', 'United States', 'America/Los_Angeles' FROM companies WHERE name = 'TechCorp'
UNION ALL
SELECT id, 'New York', 'United States', 'America/New_York' FROM companies WHERE name = 'TechCorp'
-- InnovateLab locations
UNION ALL
SELECT id, 'Paris', 'France', 'Europe/Paris' FROM companies WHERE name = 'InnovateLab'
UNION ALL
SELECT id, 'Lyon', 'France', 'Europe/Paris' FROM companies WHERE name = 'InnovateLab';

-- 3. Create Cost Centers
INSERT INTO cost_centers (company_id, code, name)
-- Guepard cost centers
SELECT id, 'ENG', 'Engineering' FROM companies WHERE name = 'Guepard'
UNION ALL
SELECT id, 'SALES', 'Sales & Marketing' FROM companies WHERE name = 'Guepard'
UNION ALL
SELECT id, 'HR', 'Human Resources' FROM companies WHERE name = 'Guepard'
-- TechCorp cost centers
UNION ALL
SELECT id, 'ENG', 'Engineering' FROM companies WHERE name = 'TechCorp'
UNION ALL
SELECT id, 'SALES', 'Sales & Marketing' FROM companies WHERE name = 'TechCorp'
UNION ALL
SELECT id, 'HR', 'Human Resources' FROM companies WHERE name = 'TechCorp'
UNION ALL
SELECT id, 'PROD', 'Product Management' FROM companies WHERE name = 'TechCorp'
-- InnovateLab cost centers
UNION ALL
SELECT id, 'R&D', 'Research & Development' FROM companies WHERE name = 'InnovateLab'
UNION ALL
SELECT id, 'SALES', 'Sales & Marketing' FROM companies WHERE name = 'InnovateLab'
UNION ALL
SELECT id, 'HR', 'Human Resources' FROM companies WHERE name = 'InnovateLab';

-- 4. Create Work Schedules
INSERT INTO work_schedules (company_id, name, weekly_hours)
-- Guepard work schedules
SELECT id, 'Full Time (40h)', 40 FROM companies WHERE name = 'Guepard'
UNION ALL
SELECT id, 'Part Time (20h)', 20 FROM companies WHERE name = 'Guepard'
-- TechCorp work schedules
UNION ALL
SELECT id, 'Full Time (40h)', 40 FROM companies WHERE name = 'TechCorp'
UNION ALL
SELECT id, 'Part Time (20h)', 20 FROM companies WHERE name = 'TechCorp'
UNION ALL
SELECT id, 'Contractor (30h)', 30 FROM companies WHERE name = 'TechCorp'
-- InnovateLab work schedules
UNION ALL
SELECT id, 'Full Time (35h)', 35 FROM companies WHERE name = 'InnovateLab'
UNION ALL
SELECT id, 'Part Time (20h)', 20 FROM companies WHERE name = 'InnovateLab';

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
WHERE c.name = 'Guepard'

-- TechCorp employees
UNION ALL

SELECT 
  c.id, 'John', 'Smith', 'admin@techcorp.com',
  '2022-01-15'::date, 'FULL_TIME'::employment_type, 'CEO',
  (SELECT id FROM locations WHERE name = 'San Francisco' AND company_id = c.id),
  (SELECT id FROM cost_centers WHERE code = 'HR' AND company_id = c.id),
  (SELECT id FROM work_schedules WHERE name = 'Full Time (40h)' AND company_id = c.id),
  200000, 'YEARLY'::salary_period, 'ACTIVE'::employee_status
FROM companies c
WHERE c.name = 'TechCorp'

UNION ALL

SELECT 
  c.id, 'Emily', 'Johnson', 'hr@techcorp.com',
  '2022-03-01'::date, 'FULL_TIME'::employment_type, 'HR Director',
  (SELECT id FROM locations WHERE name = 'New York' AND company_id = c.id),
  (SELECT id FROM cost_centers WHERE code = 'HR' AND company_id = c.id),
  (SELECT id FROM work_schedules WHERE name = 'Full Time (40h)' AND company_id = c.id),
  120000, 'YEARLY'::salary_period, 'ACTIVE'::employee_status
FROM companies c
WHERE c.name = 'TechCorp'

UNION ALL

SELECT 
  c.id, 'Michael', 'Brown', 'manager@techcorp.com',
  '2022-06-01'::date, 'FULL_TIME'::employment_type, 'Engineering Manager',
  (SELECT id FROM locations WHERE name = 'San Francisco' AND company_id = c.id),
  (SELECT id FROM cost_centers WHERE code = 'ENG' AND company_id = c.id),
  (SELECT id FROM work_schedules WHERE name = 'Full Time (40h)' AND company_id = c.id),
  150000, 'YEARLY'::salary_period, 'ACTIVE'::employee_status
FROM companies c
WHERE c.name = 'TechCorp'

UNION ALL

SELECT 
  c.id, 'Sarah', 'Davis', 'employee@techcorp.com',
  '2023-01-15'::date, 'FULL_TIME'::employment_type, 'Senior Developer',
  (SELECT id FROM locations WHERE name = 'New York' AND company_id = c.id),
  (SELECT id FROM cost_centers WHERE code = 'ENG' AND company_id = c.id),
  (SELECT id FROM work_schedules WHERE name = 'Full Time (40h)' AND company_id = c.id),
  110000, 'YEARLY'::salary_period, 'ACTIVE'::employee_status
FROM companies c
WHERE c.name = 'TechCorp'

-- InnovateLab employees
UNION ALL

SELECT 
  c.id, 'Pierre', 'Dubois', 'admin@innovatelab.fr',
  '2021-09-01'::date, 'FULL_TIME'::employment_type, 'Directeur Général',
  (SELECT id FROM locations WHERE name = 'Paris' AND company_id = c.id),
  (SELECT id FROM cost_centers WHERE code = 'HR' AND company_id = c.id),
  (SELECT id FROM work_schedules WHERE name = 'Full Time (35h)' AND company_id = c.id),
  80000, 'YEARLY'::salary_period, 'ACTIVE'::employee_status
FROM companies c
WHERE c.name = 'InnovateLab'

UNION ALL

SELECT 
  c.id, 'Marie', 'Martin', 'hr@innovatelab.fr',
  '2022-02-01'::date, 'FULL_TIME'::employment_type, 'Responsable RH',
  (SELECT id FROM locations WHERE name = 'Lyon' AND company_id = c.id),
  (SELECT id FROM cost_centers WHERE code = 'HR' AND company_id = c.id),
  (SELECT id FROM work_schedules WHERE name = 'Full Time (35h)' AND company_id = c.id),
  55000, 'YEARLY'::salary_period, 'ACTIVE'::employee_status
FROM companies c
WHERE c.name = 'InnovateLab'

UNION ALL

SELECT 
  c.id, 'Jean', 'Leroy', 'manager@innovatelab.fr',
  '2022-05-01'::date, 'FULL_TIME'::employment_type, 'Chef de Projet R&D',
  (SELECT id FROM locations WHERE name = 'Paris' AND company_id = c.id),
  (SELECT id FROM cost_centers WHERE code = 'R&D' AND company_id = c.id),
  (SELECT id FROM work_schedules WHERE name = 'Full Time (35h)' AND company_id = c.id),
  65000, 'YEARLY'::salary_period, 'ACTIVE'::employee_status
FROM companies c
WHERE c.name = 'InnovateLab'

UNION ALL

SELECT 
  c.id, 'Sophie', 'Moreau', 'employee@innovatelab.fr',
  '2023-03-01'::date, 'FULL_TIME'::employment_type, 'Ingénieur R&D',
  (SELECT id FROM locations WHERE name = 'Lyon' AND company_id = c.id),
  (SELECT id FROM cost_centers WHERE code = 'R&D' AND company_id = c.id),
  (SELECT id FROM work_schedules WHERE name = 'Full Time (35h)' AND company_id = c.id),
  45000, 'YEARLY'::salary_period, 'ACTIVE'::employee_status
FROM companies c
WHERE c.name = 'InnovateLab';

-- 6. Update employee manager relationships
-- Guepard relationships
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

-- TechCorp relationships
-- Emily (HR Director) reports to John (CEO)
UPDATE employees 
SET manager_id = (SELECT id FROM employees WHERE email = 'admin@techcorp.com')
WHERE email = 'hr@techcorp.com';

-- Michael (Engineering Manager) reports to John (CEO)
UPDATE employees 
SET manager_id = (SELECT id FROM employees WHERE email = 'admin@techcorp.com')
WHERE email = 'manager@techcorp.com';

-- Sarah (Senior Developer) reports to Michael (Engineering Manager)
UPDATE employees 
SET manager_id = (SELECT id FROM employees WHERE email = 'manager@techcorp.com')
WHERE email = 'employee@techcorp.com';

-- InnovateLab relationships
-- Marie (Responsable RH) reports to Pierre (Directeur Général)
UPDATE employees 
SET manager_id = (SELECT id FROM employees WHERE email = 'admin@innovatelab.fr')
WHERE email = 'hr@innovatelab.fr';

-- Jean (Chef de Projet R&D) reports to Pierre (Directeur Général)
UPDATE employees 
SET manager_id = (SELECT id FROM employees WHERE email = 'admin@innovatelab.fr')
WHERE email = 'manager@innovatelab.fr';

-- Sophie (Ingénieur R&D) reports to Jean (Chef de Projet R&D)
UPDATE employees 
SET manager_id = (SELECT id FROM employees WHERE email = 'manager@innovatelab.fr')
WHERE email = 'employee@innovatelab.fr';

-- 6.1. Create Employee Profiles (Personal Information)
INSERT INTO employee_profiles (employee_id, date_of_birth, gender, nationality, marital_status, personal_phone, blood_type)
SELECT id, '1985-03-15'::date, 'Male', 'Tunisian', 'Married', '+216 98 123 456', 'O+' FROM employees WHERE email = 'admin@guepard.run'
UNION ALL
SELECT id, '1990-07-22'::date, 'Female', 'Tunisian', 'Single', '+216 98 654 321', 'A+' FROM employees WHERE email = 'hr@guepard.run'
UNION ALL
SELECT id, '1988-11-10'::date, 'Male', 'Tunisian', 'Married', '+216 98 112 233', 'B+' FROM employees WHERE email = 'manager@guepard.run'
UNION ALL
SELECT id, '1995-05-18'::date, 'Female', 'French', 'Single', '+216 98 321 654', 'AB+' FROM employees WHERE email = 'employee@guepard.run';

-- 6.2. Create Employee Addresses
INSERT INTO employee_addresses (employee_id, address_type, address, city, state, country, postal_code, is_primary)
SELECT id, 'PERSONAL', '123 Avenue Habib Bourguiba, Tunis 1000', 'Tunis', 'Tunis', 'Tunisia', '1000', true FROM employees WHERE email = 'admin@guepard.run'
UNION ALL
SELECT id, 'PERSONAL', '456 Rue de la République, Tunis 1000', 'Tunis', 'Tunis', 'Tunisia', '1000', true FROM employees WHERE email = 'hr@guepard.run'
UNION ALL
SELECT id, 'PERSONAL', '789 Avenue de France, Tunis 1000', 'Tunis', 'Tunis', 'Tunisia', '1000', true FROM employees WHERE email = 'manager@guepard.run'
UNION ALL
SELECT id, 'PERSONAL', '321 Rue de la Paix, Sfax 3000', 'Sfax', 'Sfax', 'Tunisia', '3000', true FROM employees WHERE email = 'employee@guepard.run';

-- 6.3. Create Employee Contacts (Emergency Contacts)
INSERT INTO employee_contacts (employee_id, contact_type, name, phone, relationship, is_primary)
SELECT id, 'EMERGENCY', 'Aicha Ben Ali', '+216 98 123 457', 'Spouse', true FROM employees WHERE email = 'admin@guepard.run'
UNION ALL
SELECT id, 'EMERGENCY', 'Mohamed Trabelsi', '+216 98 654 322', 'Father', true FROM employees WHERE email = 'hr@guepard.run'
UNION ALL
SELECT id, 'EMERGENCY', 'Leila Karray', '+216 98 112 234', 'Spouse', true FROM employees WHERE email = 'manager@guepard.run'
UNION ALL
SELECT id, 'EMERGENCY', 'Pierre Mansouri', '+33 1 23 45 67 89', 'Father', true FROM employees WHERE email = 'employee@guepard.run';

-- 6.4. Create Employee Documents
INSERT INTO employee_documents (employee_id, document_type, document_number, issuing_authority, expiry_date, is_verified)
-- Ahmed's documents
SELECT id, 'NATIONAL_ID', '12345678', 'Tunisian Government', NULL, true FROM employees WHERE email = 'admin@guepard.run'
UNION ALL
SELECT id, 'PASSPORT', 'TN123456789', 'Tunisian Government', '2030-03-15'::date, true FROM employees WHERE email = 'admin@guepard.run'
-- Fatma's documents
UNION ALL
SELECT id, 'NATIONAL_ID', '87654321', 'Tunisian Government', NULL, true FROM employees WHERE email = 'hr@guepard.run'
UNION ALL
SELECT id, 'PASSPORT', 'TN987654321', 'Tunisian Government', '2029-07-22'::date, true FROM employees WHERE email = 'hr@guepard.run'
-- Mohamed's documents
UNION ALL
SELECT id, 'NATIONAL_ID', '11223344', 'Tunisian Government', NULL, true FROM employees WHERE email = 'manager@guepard.run'
UNION ALL
SELECT id, 'PASSPORT', 'TN112233445', 'Tunisian Government', '2028-11-10'::date, true FROM employees WHERE email = 'manager@guepard.run'
-- Sara's documents (Foreign employee)
UNION ALL
SELECT id, 'PASSPORT', 'FR123456789', 'French Government', '2027-05-18'::date, true FROM employees WHERE email = 'employee@guepard.run'
UNION ALL
SELECT id, 'WORK_PERMIT', 'WP2024001', 'Tunisian Ministry of Labor', '2025-04-01'::date, false FROM employees WHERE email = 'employee@guepard.run'
UNION ALL
SELECT id, 'VISA', 'V123456789', 'Tunisian Embassy', '2025-04-01'::date, false FROM employees WHERE email = 'employee@guepard.run';

-- 6.5. Create Employee Financial Info
INSERT INTO employee_financial_info (employee_id, info_type, bank_name, account_number, routing_number, tax_id, social_security_number, tax_exemptions, is_primary)
SELECT id, 'BANK_ACCOUNT', 'Banque de Tunisie', '1234567890123456', '123456789', 'TAX123456789', '123456789012', 2, true FROM employees WHERE email = 'admin@guepard.run'
UNION ALL
SELECT id, 'BANK_ACCOUNT', 'Banque Internationale Arabe de Tunisie', '9876543210987654', '987654321', 'TAX987654321', '987654321098', 1, true FROM employees WHERE email = 'hr@guepard.run'
UNION ALL
SELECT id, 'BANK_ACCOUNT', 'Attijari Bank', '1122334455667788', '112233445', 'TAX112233445', '112233445566', 2, true FROM employees WHERE email = 'manager@guepard.run'
UNION ALL
SELECT id, 'BANK_ACCOUNT', 'Société Générale', '3216549876543210', '321654987', 'TAX321654987', NULL, 1, true FROM employees WHERE email = 'employee@guepard.run';

-- 6.6. Create Employee Medical Info
INSERT INTO employee_medical_info (employee_id, insurance_provider, insurance_number, policy_number)
SELECT id, 'CNAM', 'MED123456789', 'POL123456789' FROM employees WHERE email = 'admin@guepard.run'
UNION ALL
SELECT id, 'CNAM', 'MED987654321', 'POL987654321' FROM employees WHERE email = 'hr@guepard.run'
UNION ALL
SELECT id, 'CNAM', 'MED112233445', 'POL112233445' FROM employees WHERE email = 'manager@guepard.run'
UNION ALL
SELECT id, 'AXA', 'MED321654987', 'POL321654987' FROM employees WHERE email = 'employee@guepard.run';

-- 6.7. Create Employee Employment Details
INSERT INTO employee_employment_details (employee_id, employee_number, department, job_level, reporting_manager, employment_contract_type, probation_period_months, notice_period_days)
SELECT id, 'EMP001', 'Executive', 'C-Level', 'Board of Directors', 'Permanent', 0, 90 FROM employees WHERE email = 'admin@guepard.run'
UNION ALL
SELECT id, 'EMP002', 'Human Resources', 'Manager', 'Ahmed Ben Ali', 'Permanent', 0, 60 FROM employees WHERE email = 'hr@guepard.run'
UNION ALL
SELECT id, 'EMP003', 'Engineering', 'Manager', 'Ahmed Ben Ali', 'Permanent', 0, 60 FROM employees WHERE email = 'manager@guepard.run'
UNION ALL
SELECT id, 'EMP004', 'Engineering', 'Senior', 'Mohamed Karray', 'Fixed Term', 3, 30 FROM employees WHERE email = 'employee@guepard.run';

-- 6.8. Create Employee Document Status
INSERT INTO employee_document_status (employee_id, status_type, is_complete, completed_at, next_review_date)
-- Ahmed's status
SELECT id, 'DOCUMENTS_COMPLETE', true, '2024-01-15'::timestamp, '2025-01-15'::date FROM employees WHERE email = 'admin@guepard.run'
UNION ALL
SELECT id, 'BACKGROUND_CHECK', true, '2024-01-15'::timestamp, '2025-01-15'::date FROM employees WHERE email = 'admin@guepard.run'
UNION ALL
SELECT id, 'MEDICAL_CHECK', true, '2024-01-15'::timestamp, '2025-01-15'::date FROM employees WHERE email = 'admin@guepard.run'
-- Fatma's status
UNION ALL
SELECT id, 'DOCUMENTS_COMPLETE', true, '2024-02-01'::timestamp, '2025-02-01'::date FROM employees WHERE email = 'hr@guepard.run'
UNION ALL
SELECT id, 'BACKGROUND_CHECK', true, '2024-02-01'::timestamp, '2025-02-01'::date FROM employees WHERE email = 'hr@guepard.run'
UNION ALL
SELECT id, 'MEDICAL_CHECK', true, '2024-02-01'::timestamp, '2025-02-01'::date FROM employees WHERE email = 'hr@guepard.run'
-- Mohamed's status
UNION ALL
SELECT id, 'DOCUMENTS_COMPLETE', true, '2024-03-01'::timestamp, '2025-03-01'::date FROM employees WHERE email = 'manager@guepard.run'
UNION ALL
SELECT id, 'BACKGROUND_CHECK', true, '2024-03-01'::timestamp, '2025-03-01'::date FROM employees WHERE email = 'manager@guepard.run'
UNION ALL
SELECT id, 'MEDICAL_CHECK', true, '2024-03-01'::timestamp, '2025-03-01'::date FROM employees WHERE email = 'manager@guepard.run'
-- Sara's status (Foreign employee - pending)
UNION ALL
SELECT id, 'DOCUMENTS_COMPLETE', false, NULL, '2024-10-01'::date FROM employees WHERE email = 'employee@guepard.run'
UNION ALL
SELECT id, 'BACKGROUND_CHECK', false, NULL, '2024-10-01'::date FROM employees WHERE email = 'employee@guepard.run'
UNION ALL
SELECT id, 'MEDICAL_CHECK', false, NULL, '2024-10-01'::date FROM employees WHERE email = 'employee@guepard.run';

-- 6.9. Create Employee Administrative Notes
INSERT INTO employee_administrative_notes (employee_id, note_type, title, content)
SELECT id, 'GENERAL', 'CEO Profile', 'CEO and founder of the company. All documents verified and up to date.' FROM employees WHERE email = 'admin@guepard.run'
UNION ALL
SELECT id, 'GENERAL', 'HR Manager Profile', 'HR Manager responsible for all administrative processes. Experienced in employee management.' FROM employees WHERE email = 'hr@guepard.run'
UNION ALL
SELECT id, 'GENERAL', 'Engineering Manager Profile', 'Engineering Manager with strong technical background. Leads the development team.' FROM employees WHERE email = 'manager@guepard.run'
UNION ALL
SELECT id, 'GENERAL', 'Foreign Employee Status', 'French national working in Tunisia. Work permit and visa documents pending renewal. Requires attention for document compliance.' FROM employees WHERE email = 'employee@guepard.run';

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

-- 7. Add cross-company employees (users who work in multiple companies)
-- These will be created as additional employees for existing users
-- Example: Ahmed (Guepard CEO) also works as consultant at TechCorp

INSERT INTO employees (
  company_id, first_name, last_name, email, 
  hire_date, employment_type, position_title, location_id, 
  cost_center_id, work_schedule_id, base_salary, salary_period, status
)
-- Ahmed (Guepard CEO) also works as consultant at TechCorp
SELECT 
  c.id, 'Ahmed', 'Ben Ali', 'admin@guepard.run',
  '2023-06-01'::date, 'CONTRACTOR'::employment_type, 'Strategic Consultant',
  (SELECT id FROM locations WHERE name = 'San Francisco' AND company_id = c.id),
  (SELECT id FROM cost_centers WHERE code = 'HR' AND company_id = c.id),
  (SELECT id FROM work_schedules WHERE name = 'Contractor (30h)' AND company_id = c.id),
  5000, 'MONTHLY'::salary_period, 'ACTIVE'::employee_status
FROM companies c
WHERE c.name = 'TechCorp'

UNION ALL

-- Sarah (TechCorp Developer) also works part-time at InnovateLab
SELECT 
  c.id, 'Sarah', 'Davis', 'employee@techcorp.com',
  '2023-09-01'::date, 'PART_TIME'::employment_type, 'Technical Advisor',
  (SELECT id FROM locations WHERE name = 'Paris' AND company_id = c.id),
  (SELECT id FROM cost_centers WHERE code = 'R&D' AND company_id = c.id),
  (SELECT id FROM work_schedules WHERE name = 'Part Time (20h)' AND company_id = c.id),
  3000, 'MONTHLY'::salary_period, 'ACTIVE'::employee_status
FROM companies c
WHERE c.name = 'InnovateLab';

-- Print summary
DO $$
BEGIN
  RAISE NOTICE 'Multi-company seed completed successfully!';
  RAISE NOTICE 'Companies created: 3';
  RAISE NOTICE '- Guepard (Tunisia) - 4 employees';
  RAISE NOTICE '- TechCorp (USA) - 4 employees + 1 cross-company';
  RAISE NOTICE '- InnovateLab (France) - 4 employees + 1 cross-company';
  RAISE NOTICE '';
  RAISE NOTICE 'Total employees: 10 (including 2 cross-company)';
  RAISE NOTICE 'Company structure: Complete with locations, cost centers, work schedules';
  RAISE NOTICE '';
  RAISE NOTICE 'Guepard Employees:';
  RAISE NOTICE 'Ahmed: admin@guepard.run - CEO & Founder';
  RAISE NOTICE 'Fatma: hr@guepard.run - HR Manager';
  RAISE NOTICE 'Mohamed: manager@guepard.run - Engineering Manager';
  RAISE NOTICE 'Sara: employee@guepard.run - Software Developer';
  RAISE NOTICE '';
  RAISE NOTICE 'TechCorp Employees:';
  RAISE NOTICE 'John: admin@techcorp.com - CEO';
  RAISE NOTICE 'Emily: hr@techcorp.com - HR Director';
  RAISE NOTICE 'Michael: manager@techcorp.com - Engineering Manager';
  RAISE NOTICE 'Sarah: employee@techcorp.com - Senior Developer';
  RAISE NOTICE 'Ahmed: admin@guepard.run - Strategic Consultant (cross-company)';
  RAISE NOTICE '';
  RAISE NOTICE 'InnovateLab Employees:';
  RAISE NOTICE 'Pierre: admin@innovatelab.fr - Directeur Général';
  RAISE NOTICE 'Marie: hr@innovatelab.fr - Responsable RH';
  RAISE NOTICE 'Jean: manager@innovatelab.fr - Chef de Projet R&D';
  RAISE NOTICE 'Sophie: employee@innovatelab.fr - Ingénieur R&D';
  RAISE NOTICE 'Sarah: employee@techcorp.com - Technical Advisor (cross-company)';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '1. Run create-multi-company-users.js to create auth users with multi-company roles';
  RAISE NOTICE '2. Script will create accounts and account_company_roles entries';
  RAISE NOTICE '3. Users can switch between companies and have different roles per company';
  RAISE NOTICE '';
  RAISE NOTICE 'Multi-Company Role Examples:';
  RAISE NOTICE 'Ahmed: ADMIN at Guepard, EMPLOYEE at TechCorp';
  RAISE NOTICE 'Sarah: EMPLOYEE at TechCorp, EMPLOYEE at InnovateLab';
END $$;
