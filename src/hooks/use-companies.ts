"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companiesApi, Company, UserCompany, CurrentCompany, CreateCompanyData } from '@/lib/api/companies';
import { useAuth } from '@/hooks/use-auth';

// Query keys
export const companyKeys = {
  all: ['companies'] as const,
  lists: () => [...companyKeys.all, 'list'] as const,
  list: (filters: string) => [...companyKeys.lists(), { filters }] as const,
  details: () => [...companyKeys.all, 'detail'] as const,
  detail: (id: string) => [...companyKeys.details(), id] as const,
  userCompanies: () => [...companyKeys.all, 'user'] as const,
  currentCompany: () => [...companyKeys.all, 'current'] as const,
};

// Hook to get all companies
export function useCompanies() {
  return useQuery({
    queryKey: companyKeys.lists(),
    queryFn: companiesApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to get user's companies
export function useUserCompanies() {
  const { user } = useAuth();
  return useQuery({
    queryKey: companyKeys.userCompanies(),
    queryFn: companiesApi.getUserCompanies,
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!user, // Only run query if user is authenticated
  });
}

// Hook to get current company
export function useCurrentCompany() {
  const { user } = useAuth();
  return useQuery({
    queryKey: companyKeys.currentCompany(),
    queryFn: companiesApi.getCurrentCompany,
    staleTime: 1 * 60 * 1000, // 1 minute
    enabled: !!user, // Only run query if user is authenticated
  });
}

// Hook to create a company
export function useCreateCompany() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (companyData: CreateCompanyData) => companiesApi.create(companyData),
    onSuccess: () => {
      // Invalidate and refetch companies list
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
    },
  });
}

// Hook to switch company
export function useSwitchCompany() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (companyId: string) => companiesApi.switchCompany(companyId),
    onSuccess: () => {
      // Invalidate current company and user companies
      queryClient.invalidateQueries({ queryKey: companyKeys.currentCompany() });
      queryClient.invalidateQueries({ queryKey: companyKeys.userCompanies() });
      // Also invalidate user session data
      queryClient.invalidateQueries({ queryKey: ['auth', 'session'] });
    },
  });
}

// Hook to get company by ID
export function useCompany(id: string) {
  return useQuery({
    queryKey: companyKeys.detail(id),
    queryFn: async () => {
      const companies = await companiesApi.getAll();
      return companies.find(company => company.id === id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
