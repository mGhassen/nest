import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leaveApi, type LeaveRequest, type CreateLeaveRequestData } from "@/lib/api";
import { useAuth } from "./use-auth";

// Hook for fetching leave requests
export function useLeaveRequests() {
  const { user, isAuthenticated } = useAuth();
  
  return useQuery<LeaveRequest[]>({
    queryKey: ['leave-requests'],
    queryFn: leaveApi.getLeaveRequests,
    enabled: isAuthenticated && !!user, // Only fetch when authenticated
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 401/403 errors
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
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