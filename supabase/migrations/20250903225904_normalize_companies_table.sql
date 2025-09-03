-- Normalize companies table by splitting into logical groups
-- This migration creates separate tables for different aspects of company data

-- 1. Create company_profiles table for business information
CREATE TABLE company_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    legal_name VARCHAR(255),
    description TEXT,
    industry VARCHAR(100),
    company_size VARCHAR(50),
    founded_year INTEGER,
    business_type VARCHAR(50),
    legal_structure VARCHAR(50),
    tax_id VARCHAR(100),
    registration_number VARCHAR(100),
    vat_number VARCHAR(100),
    fiscal_year_start DATE,
    fiscal_year_end DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id)
);

-- 2. Create company_addresses table for location data
CREATE TABLE company_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    address_type VARCHAR(20) DEFAULT 'HEADQUARTERS' CHECK (address_type IN ('HEADQUARTERS', 'BRANCH', 'MAILING', 'BILLING')),
    address TEXT,
    address_line_2 TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    timezone VARCHAR(50),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create company_branding table for visual identity
CREATE TABLE company_branding (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    logo_url TEXT,
    brand_color VARCHAR(7),
    secondary_color VARCHAR(7),
    icon_name VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id)
);

-- 4. Create company_social table for social media links
CREATE TABLE company_social (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    linkedin_url VARCHAR(255),
    twitter_url VARCHAR(255),
    facebook_url VARCHAR(255),
    instagram_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id)
);

-- 5. Create company_contacts table for contact information
CREATE TABLE company_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    contact_type VARCHAR(20) DEFAULT 'GENERAL' CHECK (contact_type IN ('GENERAL', 'SUPPORT', 'SALES', 'BILLING', 'LEGAL')),
    website VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    fax VARCHAR(50),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Migrate existing data from companies table to new tables
-- Migrate to company_profiles
INSERT INTO company_profiles (
    company_id, legal_name, description, industry, company_size, founded_year,
    business_type, legal_structure, tax_id, registration_number, vat_number,
    fiscal_year_start, fiscal_year_end
)
SELECT 
    id, legal_name, description, industry, company_size, founded_year,
    business_type, legal_structure, tax_id, registration_number, vat_number,
    fiscal_year_start, fiscal_year_end
FROM companies
WHERE legal_name IS NOT NULL 
   OR description IS NOT NULL 
   OR industry IS NOT NULL 
   OR company_size IS NOT NULL 
   OR founded_year IS NOT NULL
   OR business_type IS NOT NULL 
   OR legal_structure IS NOT NULL 
   OR tax_id IS NOT NULL 
   OR registration_number IS NOT NULL 
   OR vat_number IS NOT NULL
   OR fiscal_year_start IS NOT NULL 
   OR fiscal_year_end IS NOT NULL;

-- Migrate to company_addresses
INSERT INTO company_addresses (
    company_id, address_type, address, address_line_2, city, state, country,
    postal_code, timezone, is_primary
)
SELECT 
    id, 'HEADQUARTERS', address, address_line_2, city, state, country,
    postal_code, timezone, TRUE
FROM companies
WHERE address IS NOT NULL 
   OR address_line_2 IS NOT NULL 
   OR city IS NOT NULL 
   OR state IS NOT NULL 
   OR country IS NOT NULL
   OR postal_code IS NOT NULL 
   OR timezone IS NOT NULL;

-- Migrate to company_branding
INSERT INTO company_branding (
    company_id, logo_url, brand_color, secondary_color
)
SELECT 
    id, logo_url, brand_color, secondary_color
FROM companies
WHERE logo_url IS NOT NULL 
   OR brand_color IS NOT NULL 
   OR secondary_color IS NOT NULL;

-- Migrate to company_social
INSERT INTO company_social (
    company_id, linkedin_url, twitter_url, facebook_url, instagram_url
)
SELECT 
    id, linkedin_url, twitter_url, facebook_url, instagram_url
FROM companies
WHERE linkedin_url IS NOT NULL 
   OR twitter_url IS NOT NULL 
   OR facebook_url IS NOT NULL 
   OR instagram_url IS NOT NULL;

-- Migrate to company_contacts
INSERT INTO company_contacts (
    company_id, contact_type, website, email, phone, fax, is_primary
)
SELECT 
    id, 'GENERAL', website, email, phone, fax, TRUE
FROM companies
WHERE website IS NOT NULL 
   OR email IS NOT NULL 
   OR phone IS NOT NULL 
   OR fax IS NOT NULL;

-- 7. Remove the migrated columns from companies table
ALTER TABLE companies DROP COLUMN IF EXISTS legal_name;
ALTER TABLE companies DROP COLUMN IF EXISTS description;
ALTER TABLE companies DROP COLUMN IF EXISTS industry;
ALTER TABLE companies DROP COLUMN IF EXISTS company_size;
ALTER TABLE companies DROP COLUMN IF EXISTS founded_year;
ALTER TABLE companies DROP COLUMN IF EXISTS website;
ALTER TABLE companies DROP COLUMN IF EXISTS email;
ALTER TABLE companies DROP COLUMN IF EXISTS phone;
ALTER TABLE companies DROP COLUMN IF EXISTS fax;
ALTER TABLE companies DROP COLUMN IF EXISTS address;
ALTER TABLE companies DROP COLUMN IF EXISTS address_line_2;
ALTER TABLE companies DROP COLUMN IF EXISTS city;
ALTER TABLE companies DROP COLUMN IF EXISTS state;
ALTER TABLE companies DROP COLUMN IF EXISTS country;
ALTER TABLE companies DROP COLUMN IF EXISTS postal_code;
ALTER TABLE companies DROP COLUMN IF EXISTS timezone;
ALTER TABLE companies DROP COLUMN IF EXISTS tax_id;
ALTER TABLE companies DROP COLUMN IF EXISTS registration_number;
ALTER TABLE companies DROP COLUMN IF EXISTS vat_number;
ALTER TABLE companies DROP COLUMN IF EXISTS business_type;
ALTER TABLE companies DROP COLUMN IF EXISTS legal_structure;
ALTER TABLE companies DROP COLUMN IF EXISTS fiscal_year_start;
ALTER TABLE companies DROP COLUMN IF EXISTS fiscal_year_end;
ALTER TABLE companies DROP COLUMN IF EXISTS logo_url;
ALTER TABLE companies DROP COLUMN IF EXISTS brand_color;
ALTER TABLE companies DROP COLUMN IF EXISTS secondary_color;
ALTER TABLE companies DROP COLUMN IF EXISTS linkedin_url;
ALTER TABLE companies DROP COLUMN IF EXISTS twitter_url;
ALTER TABLE companies DROP COLUMN IF EXISTS facebook_url;
ALTER TABLE companies DROP COLUMN IF EXISTS instagram_url;

-- 8. Add updated_at triggers to new tables
CREATE TRIGGER update_company_profiles_updated_at 
    BEFORE UPDATE ON company_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_addresses_updated_at 
    BEFORE UPDATE ON company_addresses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_branding_updated_at 
    BEFORE UPDATE ON company_branding 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_social_updated_at 
    BEFORE UPDATE ON company_social 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_contacts_updated_at 
    BEFORE UPDATE ON company_contacts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Create indexes for performance
CREATE INDEX idx_company_profiles_company_id ON company_profiles(company_id);
CREATE INDEX idx_company_addresses_company_id ON company_addresses(company_id);
CREATE INDEX idx_company_addresses_type ON company_addresses(address_type);
CREATE INDEX idx_company_branding_company_id ON company_branding(company_id);
CREATE INDEX idx_company_social_company_id ON company_social(company_id);
CREATE INDEX idx_company_contacts_company_id ON company_contacts(company_id);
CREATE INDEX idx_company_contacts_type ON company_contacts(contact_type);

-- 10. Add comments
COMMENT ON TABLE company_profiles IS 'Business information and legal details for companies';
COMMENT ON TABLE company_addresses IS 'Physical and mailing addresses for companies';
COMMENT ON TABLE company_branding IS 'Visual identity and branding information for companies';
COMMENT ON TABLE company_social IS 'Social media links and online presence for companies';
COMMENT ON TABLE company_contacts IS 'Contact information and communication channels for companies';

COMMENT ON TABLE companies IS 'Core company information - now normalized with related tables for detailed information';
COMMENT ON COLUMN company_branding.icon_name IS 'Icon name for company switcher display (e.g., Building2, Users, etc.)';

-- 11. Create views for easy access to complete company data
CREATE VIEW companies_complete AS
SELECT 
    c.id,
    c.name,
    c.country_code,
    c.currency,
    c.status,
    c.is_verified,
    c.verification_date,
    c.created_by,
    c.updated_by,
    c.created_at,
    c.updated_at,
    -- Profile information
    cp.legal_name,
    cp.description,
    cp.industry,
    cp.company_size,
    cp.founded_year,
    cp.business_type,
    cp.legal_structure,
    cp.tax_id,
    cp.registration_number,
    cp.vat_number,
    cp.fiscal_year_start,
    cp.fiscal_year_end,
    -- Primary address
    ca.address,
    ca.address_line_2,
    ca.city,
    ca.state,
    ca.country,
    ca.postal_code,
    ca.timezone,
    -- Primary contact
    cc.website,
    cc.email,
    cc.phone,
    cc.fax,
    -- Branding
    cb.logo_url,
    cb.brand_color,
    cb.secondary_color,
    cb.icon_name,
    -- Social media
    cs.linkedin_url,
    cs.twitter_url,
    cs.facebook_url,
    cs.instagram_url
FROM companies c
LEFT JOIN company_profiles cp ON c.id = cp.company_id
LEFT JOIN company_addresses ca ON c.id = ca.company_id AND ca.is_primary = TRUE
LEFT JOIN company_contacts cc ON c.id = cc.company_id AND cc.is_primary = TRUE
LEFT JOIN company_branding cb ON c.id = cb.company_id
LEFT JOIN company_social cs ON c.id = cs.company_id;

COMMENT ON VIEW companies_complete IS 'Complete company information combining all related tables for easy access';

-- Print summary
DO $$
BEGIN
  RAISE NOTICE 'Company table normalization completed successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'New structure:';
  RAISE NOTICE '- companies: Core information (id, name, country_code, currency, status, etc.)';
  RAISE NOTICE '- company_profiles: Business information (legal_name, description, industry, etc.)';
  RAISE NOTICE '- company_addresses: Location data (address, city, state, country, etc.)';
  RAISE NOTICE '- company_contacts: Contact information (website, email, phone, etc.)';
  RAISE NOTICE '- company_branding: Visual identity (logo_url, brand_color, etc.)';
  RAISE NOTICE '- company_social: Social media links (linkedin_url, twitter_url, etc.)';
  RAISE NOTICE '';
  RAISE NOTICE 'Benefits:';
  RAISE NOTICE '- Better data organization and normalization';
  RAISE NOTICE '- Easier to maintain and extend';
  RAISE NOTICE '- Better performance for specific queries';
  RAISE NOTICE '- More flexible data structure';
  RAISE NOTICE '';
  RAISE NOTICE 'Access:';
  RAISE NOTICE '- Use companies_complete view for full company data';
  RAISE NOTICE '- Query individual tables for specific information';
  RAISE NOTICE '- All existing data has been migrated';
END $$;
