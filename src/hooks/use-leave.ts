import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { LeaveRequest } from "@/types/leave-request";

// Types for leave API responses
interface LeaveBalance {
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  pendingDays: number;
}

interface LeaveRequestResponse {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  type: string;
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

// Hook for fetching leave requests
export function useLeaveRequests(companyId?: string) {
  return useQuery<LeaveRequest[]>({
    queryKey: ['/api/leave'],
    queryFn: async () => {
      return await apiFetch<LeaveRequest[]>('/api/leave');
    },
    enabled: !!companyId,
  });
}

// Hook for fetching pending leave requests
export function usePendingLeaveRequests(companyId?: string) {
  const { data: leaveRequests = [], ...rest } = useLeaveRequests(companyId);
  
  const pendingRequests = leaveRequests.filter(
    (request) => request.status === 'SUBMITTED'
  );

  return {
    data: pendingRequests,
    ...rest,
  };
}

// Hook for creating a leave request
export function useLeaveRequestCreate() {
  const queryClient = useQueryClient();

  return useMutation<LeaveRequestResponse, Error, Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt'> & { employeeId: string }>({
    mutationFn: async (data) => {
      return await apiFetch<LeaveRequestResponse>('/api/leave', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (_, variables) => {
      // Invalidate leave requests and leave balance
      queryClient.invalidateQueries({ queryKey: ['/api/leave'] });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/people', variables.employeeId, 'leave-balance'] 
      });
    },
  });
}

// Hook for updating leave request status (approve/reject)
export function useLeaveRequestUpdate() {
  const queryClient = useQueryClient();

  return useMutation<LeaveRequestResponse, Error, { id: string; status: 'APPROVED' | 'REJECTED'; reason?: string }>({
    mutationFn: async ({ id, status, reason }) => {
      return await apiFetch<LeaveRequestResponse>(`/api/leave/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status, reason }),
      });
    },
    onSuccess: (data) => {
      // Invalidate leave requests and leave balance
      queryClient.invalidateQueries({ queryKey: ['/api/leave'] });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/people', data.employeeId, 'leave-balance'] 
      });
    },
  });
}

// Hook for fetching leave balance for a specific employee
export function useLeaveBalance(employeeId: string) {
  return useQuery<LeaveBalance>({
    queryKey: ['/api/people', employeeId, 'leave-balance'],
    queryFn: async () => {
      return await apiFetch<LeaveBalance>(`/api/people/${employeeId}/leave-balance`);
    },
    enabled: !!employeeId,
  });
}
