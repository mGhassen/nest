-- Redesign administrative structure with proper normalization
-- This migration creates separate tables for different types of administrative data

-- Create employee_profiles table for personal information
CREATE TABLE IF NOT EXISTS employee_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date_of_birth DATE,
    gender VARCHAR(20),
    nationality VARCHAR(100),
    marital_status VARCHAR(20),
    personal_phone VARCHAR(20),
    blood_type VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id)
);

-- Create employee_addresses table for address information
CREATE TABLE IF NOT EXISTS employee_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    address_type VARCHAR(20) NOT NULL DEFAULT 'PERSONAL', -- PERSONAL, EMERGENCY, etc.
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employee_contacts table for emergency contacts
CREATE TABLE IF NOT EXISTS employee_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    contact_type VARCHAR(20) NOT NULL DEFAULT 'EMERGENCY', -- EMERGENCY, SPOUSE, etc.
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    relationship VARCHAR(100),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employee_documents table for identity documents
CREATE TABLE IF NOT EXISTS employee_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- NATIONAL_ID, PASSPORT, WORK_PERMIT, VISA, etc.
    document_number VARCHAR(100),
    issuing_authority VARCHAR(255),
    issue_date DATE,
    expiry_date DATE,
    document_url TEXT, -- For storing document files
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES accounts(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employee_financial_info table for banking and tax information
CREATE TABLE IF NOT EXISTS employee_financial_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    info_type VARCHAR(50) NOT NULL, -- BANK_ACCOUNT, TAX_INFO, SOCIAL_SECURITY, etc.
    bank_name VARCHAR(255),
    account_number VARCHAR(50),
    routing_number VARCHAR(50),
    swift_code VARCHAR(20),
    tax_id VARCHAR(50),
    social_security_number VARCHAR(50),
    tax_exemptions INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employee_medical_info table for medical information
CREATE TABLE IF NOT EXISTS employee_medical_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    insurance_provider VARCHAR(255),
    insurance_number VARCHAR(50),
    policy_number VARCHAR(50),
    coverage_start_date DATE,
    coverage_end_date DATE,
    medical_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employee_employment_details table for employment-specific information
CREATE TABLE IF NOT EXISTS employee_employment_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    employee_number VARCHAR(50),
    department VARCHAR(100),
    job_level VARCHAR(50),
    reporting_manager VARCHAR(255),
    employment_contract_type VARCHAR(50),
    probation_period_months INTEGER DEFAULT 3,
    notice_period_days INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id)
);

-- Create employee_document_status table for tracking document completion
CREATE TABLE IF NOT EXISTS employee_document_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    status_type VARCHAR(50) NOT NULL, -- DOCUMENTS_COMPLETE, BACKGROUND_CHECK, MEDICAL_CHECK, etc.
    is_complete BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID REFERENCES accounts(id),
    notes TEXT,
    next_review_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, status_type)
);

-- Create employee_administrative_notes table for notes and comments
CREATE TABLE IF NOT EXISTS employee_administrative_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    note_type VARCHAR(50) NOT NULL DEFAULT 'GENERAL', -- GENERAL, DOCUMENT_REVIEW, etc.
    title VARCHAR(255),
    content TEXT NOT NULL,
    created_by UUID REFERENCES accounts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE employee_profiles IS 'Personal information for employees (DOB, gender, nationality, etc.)';
COMMENT ON TABLE employee_addresses IS 'Address information for employees (personal, emergency, etc.)';
COMMENT ON TABLE employee_contacts IS 'Emergency and other contact information for employees';
COMMENT ON TABLE employee_documents IS 'Identity documents and work authorization for employees';
COMMENT ON TABLE employee_financial_info IS 'Banking and tax information for employees';
COMMENT ON TABLE employee_medical_info IS 'Medical insurance and health information for employees';
COMMENT ON TABLE employee_employment_details IS 'Employment-specific details (employee number, department, etc.)';
COMMENT ON TABLE employee_document_status IS 'Tracking of document completion status for employees';
COMMENT ON TABLE employee_administrative_notes IS 'Administrative notes and comments for employees';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employee_profiles_employee_id ON employee_profiles(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_profiles_nationality ON employee_profiles(nationality);

CREATE INDEX IF NOT EXISTS idx_employee_addresses_employee_id ON employee_addresses(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_addresses_type ON employee_addresses(address_type);

CREATE INDEX IF NOT EXISTS idx_employee_contacts_employee_id ON employee_contacts(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_contacts_type ON employee_contacts(contact_type);

CREATE INDEX IF NOT EXISTS idx_employee_documents_employee_id ON employee_documents(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_documents_type ON employee_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_employee_documents_expiry ON employee_documents(expiry_date);

CREATE INDEX IF NOT EXISTS idx_employee_financial_info_employee_id ON employee_financial_info(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_financial_info_type ON employee_financial_info(info_type);

CREATE INDEX IF NOT EXISTS idx_employee_medical_info_employee_id ON employee_medical_info(employee_id);

CREATE INDEX IF NOT EXISTS idx_employee_employment_details_employee_id ON employee_employment_details(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_employment_details_department ON employee_employment_details(department);
CREATE INDEX IF NOT EXISTS idx_employee_employment_details_employee_number ON employee_employment_details(employee_number);

CREATE INDEX IF NOT EXISTS idx_employee_document_status_employee_id ON employee_document_status(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_document_status_type ON employee_document_status(status_type);
CREATE INDEX IF NOT EXISTS idx_employee_document_status_complete ON employee_document_status(is_complete);

CREATE INDEX IF NOT EXISTS idx_employee_administrative_notes_employee_id ON employee_administrative_notes(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_administrative_notes_type ON employee_administrative_notes(note_type);

-- Apply updated_at triggers to all new tables
CREATE TRIGGER update_employee_profiles_updated_at BEFORE UPDATE ON employee_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employee_addresses_updated_at BEFORE UPDATE ON employee_addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employee_contacts_updated_at BEFORE UPDATE ON employee_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employee_documents_updated_at BEFORE UPDATE ON employee_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employee_financial_info_updated_at BEFORE UPDATE ON employee_financial_info FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employee_medical_info_updated_at BEFORE UPDATE ON employee_medical_info FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employee_employment_details_updated_at BEFORE UPDATE ON employee_employment_details FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employee_document_status_updated_at BEFORE UPDATE ON employee_document_status FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employee_administrative_notes_updated_at BEFORE UPDATE ON employee_administrative_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) on all new tables
ALTER TABLE employee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_financial_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_medical_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_employment_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_document_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_administrative_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for all new tables
CREATE POLICY "Allow all operations for testing" ON employee_profiles FOR ALL USING (true);
CREATE POLICY "Allow all operations for testing" ON employee_addresses FOR ALL USING (true);
CREATE POLICY "Allow all operations for testing" ON employee_contacts FOR ALL USING (true);
CREATE POLICY "Allow all operations for testing" ON employee_documents FOR ALL USING (true);
CREATE POLICY "Allow all operations for testing" ON employee_financial_info FOR ALL USING (true);
CREATE POLICY "Allow all operations for testing" ON employee_medical_info FOR ALL USING (true);
CREATE POLICY "Allow all operations for testing" ON employee_employment_details FOR ALL USING (true);
CREATE POLICY "Allow all operations for testing" ON employee_document_status FOR ALL USING (true);
CREATE POLICY "Allow all operations for testing" ON employee_administrative_notes FOR ALL USING (true);

-- Grant necessary permissions to authenticated users
GRANT ALL ON public.employee_profiles TO authenticated;
GRANT ALL ON public.employee_addresses TO authenticated;
GRANT ALL ON public.employee_contacts TO authenticated;
GRANT ALL ON public.employee_documents TO authenticated;
GRANT ALL ON public.employee_financial_info TO authenticated;
GRANT ALL ON public.employee_medical_info TO authenticated;
GRANT ALL ON public.employee_employment_details TO authenticated;
GRANT ALL ON public.employee_document_status TO authenticated;
GRANT ALL ON public.employee_administrative_notes TO authenticated;
