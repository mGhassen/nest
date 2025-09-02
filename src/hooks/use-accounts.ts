import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accountApi, type Account } from "@/lib/api";
import { useAuth } from "./use-auth";

// Hook for fetching accounts list
export function useAccountsList() {
  const { user, isAuthenticated } = useAuth();
  
  return useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: accountApi.getAccounts,
    enabled: isAuthenticated && !!user, // Only fetch when authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 401/403 errors
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Hook for creating a new account
export function useAccountCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: accountApi.createAccount,
    onSuccess: () => {
      // Invalidate and refetch accounts list
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

// Hook for password reset (send email)
export function useAccountPasswordReset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId: string) => accountApi.resetPassword(accountId),
    onSuccess: () => {
      // Invalidate accounts list to refresh status
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

// Hook for setting password directly
export function useAccountSetPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ accountId, password }: { accountId: string; password: string }) => 
      accountApi.setPassword(accountId, password),
    onSuccess: () => {
      // Invalidate accounts list to refresh status
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

// Hook for updating account status
export function useAccountStatusUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ accountId, status }: { accountId: string; status: string }) => 
      accountApi.updateAccountStatus(accountId, status),
    onSuccess: () => {
      // Invalidate accounts list to refresh status
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

// Hook for getting account events
export function useAccountEvents(accountId: string) {
  return useQuery({
    queryKey: ['account-events', accountId],
    queryFn: () => accountApi.getAccountEvents(accountId),
    enabled: !!accountId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Employee-Account Management Hooks

// Hook for sending employee invitation (creates account)
export function useEmployeeInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ employeeId, role }: { employeeId: string; role?: string }) => 
      accountApi.sendInvitation(employeeId, role),
    onSuccess: (_, variables) => {
      // Invalidate employee data to refresh account information
      queryClient.invalidateQueries({ queryKey: ['employee', variables.employeeId] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

// Hook for linking employee to existing account
export function useEmployeeLinkAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ employeeId, accountId }: { employeeId: string; accountId: string }) => 
      accountApi.linkAccount(employeeId, accountId),
    onSuccess: (_, variables) => {
      // Invalidate employee data to refresh account information
      queryClient.invalidateQueries({ queryKey: ['employee', variables.employeeId] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

// Hook for unlinking employee from account
export function useEmployeeUnlinkAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId: string) => 
      accountApi.unlinkAccount(accountId),
    onSuccess: () => {
      // Invalidate employee and account data to refresh information
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['employee'] });
    },
  });
}
