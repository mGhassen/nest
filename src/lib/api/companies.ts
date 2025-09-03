import { apiFetch } from './index';

export interface Company {
  id: string;
  name: string;
  legal_name?: string;
  description?: string;
  industry?: string;
  company_size?: string;
  founded_year?: number;
  website?: string;
  email?: string;
  phone?: string;
  fax?: string;
  address?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  country_code: string;
  country?: string;
  postal_code?: string;
  timezone?: string;
  tax_id?: string;
  registration_number?: string;
  vat_number?: string;
  business_type?: string;
  legal_structure?: string;
  currency: string;
  fiscal_year_start?: string;
  fiscal_year_end?: string;
  brand_color?: string;
  secondary_color?: string;
  logo_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  status?: string;
  is_verified?: boolean;
  verification_date?: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface UserCompany {
  company_id: string;
  company_name: string;
  role: 'ADMIN' | 'EMPLOYEE';
}

export interface CurrentCompany {
  company_id: string;
  company_name: string;
  role: 'ADMIN' | 'EMPLOYEE';
}

export interface CreateCompanyData {
  name: string;
  legal_name?: string;
  description?: string;
  industry: string;
  company_size: string;
  founded_year?: number;
  website?: string;
  email?: string;
  phone?: string;
  fax?: string;
  address?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  country_code: string;
  postal_code?: string;
  timezone?: string;
  tax_id?: string;
  registration_number?: string;
  vat_number?: string;
  business_type?: string;
  legal_structure?: string;
  currency: string;
  fiscal_year_start?: string;
  fiscal_year_end?: string;
  brand_color?: string;
  secondary_color?: string;
  logo_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  facebook_url?: string;
  instagram_url?: string;
}

// Company API service
export const companiesApi = {
  // Get all companies
  async getAll(): Promise<Company[]> {
    const response = await apiFetch('/api/companies');
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch companies');
    }
    return response.companies;
  },

  // Create a new company
  async create(companyData: CreateCompanyData): Promise<Company> {
    const response = await apiFetch('/api/companies', {
      method: 'POST',
      body: JSON.stringify(companyData),
    });
    if (!response.success) {
      throw new Error(response.error || 'Failed to create company');
    }
    return response.company;
  },

  // Get user's companies
  async getUserCompanies(): Promise<UserCompany[]> {
    const response = await apiFetch('/api/user/companies');
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch user companies');
    }
    return response.companies;
  },

  // Get current company
  async getCurrentCompany(): Promise<CurrentCompany> {
    const response = await apiFetch('/api/user/current-company');
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch current company');
    }
    return response.currentCompany;
  },

  // Switch to a different company
  async switchCompany(companyId: string): Promise<CurrentCompany> {
    const response = await apiFetch('/api/user/current-company', {
      method: 'POST',
      body: JSON.stringify({ company_id: companyId }),
    });
    if (!response.success) {
      throw new Error(response.error || 'Failed to switch company');
    }
    return response.currentCompany;
  },
};
