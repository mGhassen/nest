import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accountApi, type Account } from "@/lib/api";

// Hook for fetching accounts list
export function useAccountsList() {
  return useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: accountApi.getAccounts,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
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

// Hook for password reset
export function useAccountPasswordReset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: accountApi.resetPassword,
    onSuccess: () => {
      // Invalidate accounts list to refresh status
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
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
