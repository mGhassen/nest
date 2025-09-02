import { useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeApi } from "@/lib/api";

// Hook for sending employee invitation
export function useEmployeeInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ employeeId, role }: { employeeId: string; role?: string }) => 
      employeeApi.sendInvitation(employeeId, role),
    onSuccess: (_, variables) => {
      // Invalidate employee data to refresh account information
      queryClient.invalidateQueries({ queryKey: ['employee', variables.employeeId] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

// Hook for employee password reset
export function useEmployeePasswordReset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId: string) => employeeApi.resetPassword(accountId),
    onSuccess: () => {
      // Invalidate employee and account data to refresh information
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['employee'] });
    },
  });
}

// Hook for linking employee to existing account
export function useEmployeeLinkAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ employeeId, accountId }: { employeeId: string; accountId: string }) => 
      employeeApi.linkAccount(employeeId, accountId),
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
      employeeApi.unlinkAccount(accountId),
    onSuccess: () => {
      // Invalidate employee and account data to refresh information
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['employee'] });
    },
  });
}
