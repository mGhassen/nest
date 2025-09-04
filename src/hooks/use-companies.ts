import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

// ============================================================================
// TYPES
// ============================================================================

export interface UserCompany {
  company_id: string;
  company_name: string;
  is_admin: boolean;
  icon_name?: string;
  hasEmployeeAccess?: boolean;
}

export interface Company {
  id: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  timezone?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCompanyData {
  // Basic Information
  name: string;
  legal_name?: string;
  description?: string;
  industry: string;
  company_size: string;
  founded_year?: number;
  
  // Contact Information
  website?: string;
  email?: string;
  phone?: string;
  fax?: string;
  
  // Address Information
  address?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  country_code: string;
  postal_code?: string;
  timezone?: string;
  
  // Business Information
  tax_id?: string;
  registration_number?: string;
  vat_number?: string;
  business_type?: string;
  legal_structure?: string;
  
  // Financial Information
  currency?: string;
  fiscal_year_start?: string;
  fiscal_year_end?: string;
  
  // Branding
  brand_color?: string;
  secondary_color?: string;
  logo_url?: string;
  
  // Social Media
  linkedin_url?: string;
  twitter_url?: string;
  facebook_url?: string;
  instagram_url?: string;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Get all companies the current user has access to
 */
export function useUserCompanies() {
  return useQuery({
    queryKey: ['user-companies'],
    queryFn: async (): Promise<UserCompany[]> => {
      const data = await apiFetch('/api/user/companies');
      console.log('useUserCompanies response:', data);
      return data.companies || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get current company information
 */
export function useCurrentCompany() {
  return useQuery({
    queryKey: ['current-company'],
    queryFn: async (): Promise<UserCompany | null> => {
      const data = await apiFetch('/api/user/current-company');
      console.log('useCurrentCompany response:', data);
      return data.currentCompany || null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Switch to a different company
 */
export function useSwitchCompany() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (companyId: string): Promise<UserCompany> => {
      const data = await apiFetch('/api/user/current-company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ company_id: companyId }),
      });
      
      return data.currentCompany;
    },
    onSuccess: () => {
      // Invalidate and refetch current company
      queryClient.invalidateQueries({ queryKey: ['current-company'] });
    },
  });
}

/**
 * Get detailed company information
 */
export function useCompanyDetails(companyId: string) {
  return useQuery({
    queryKey: ['company-details', companyId],
    queryFn: async (): Promise<any> => {
      const data = await apiFetch(`/api/companies/${companyId}`);
      return data.company;
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Create a new company (superuser only)
 */
export function useCreateCompany() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (companyData: CreateCompanyData): Promise<Company> => {
      const data = await apiFetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyData),
      });
      
      return data.company;
    },
    onSuccess: () => {
      // Invalidate user companies to refresh the list
      queryClient.invalidateQueries({ queryKey: ['user-companies'] });
    },
  });
}