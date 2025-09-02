import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

interface SendInvitationData {
  role: "ADMIN" | "EMPLOYEE";
}

interface SendInvitationResponse {
  success: boolean;
  message: string;
  account: any;
  authUser: any;
}

// Hook for sending invitations to employees
export function useSendInvitation() {
  const queryClient = useQueryClient();

  return useMutation<SendInvitationResponse, Error, { employeeId: string; data: SendInvitationData }>({
    mutationFn: async ({ employeeId, data }) => {
      return await apiFetch<SendInvitationResponse>(`/api/people/${employeeId}/invite`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      // Invalidate and refetch people list
      queryClient.invalidateQueries({ queryKey: ['/api/people'] });
    },
  });
}
