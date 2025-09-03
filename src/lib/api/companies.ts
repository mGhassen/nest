import { apiFetch } from './index';

export interface Company {
  id: string;
  name: string;
  country_code: string;
  currency: string;
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
  country_code: string;
  currency: string;
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
