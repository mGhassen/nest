import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leaveApi, type LeaveRequest, type CreateLeaveRequestData } from "@/lib/api";

// Hook for fetching leave requests
export function useLeaveRequests() {
  return useQuery<LeaveRequest[]>({
    queryKey: ['leave-requests'],
    queryFn: leaveApi.getLeaveRequests,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for creating a leave request
export function useLeaveRequestCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaveApi.createLeaveRequest,
    onSuccess: () => {
      // Invalidate and refetch leave requests list
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
    },
  });
}