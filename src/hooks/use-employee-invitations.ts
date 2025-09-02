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
    mutationFn: employeeApi.resetPassword,
    onSuccess: (_, employeeId) => {
      // Invalidate employee data to refresh account information
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] });
    },
  });
}
