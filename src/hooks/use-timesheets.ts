import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Timesheet } from "@/types/leave-request";

// Types for timesheet API responses
interface TimesheetResponse {
  id: string;
  employeeId: string;
  weekStartDate: string;
  weekEndDate: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  totalHours: number;
  entries: Array<{
    date: string;
    hours: number;
    project?: string;
    description?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface CreateTimesheetRequest {
  employeeId: string;
  weekStartDate: string;
  weekEndDate: string;
  entries: Array<{
    date: string;
    hours: number;
    project?: string;
    description?: string;
  }>;
}

// Hook for fetching timesheets
export function useTimesheets(companyId?: string) {
  return useQuery<Timesheet[]>({
    queryKey: ['/api/admin/timesheets'],
    queryFn: async () => {
      return await apiFetch<Timesheet[]>('/api/admin/timesheets');
    },
    enabled: !!companyId,
  });
}

// Hook for fetching pending timesheets
export function usePendingTimesheets(companyId?: string) {
  const { data: timesheets = [], ...rest } = useTimesheets(companyId);
  
  const pendingTimesheets = timesheets.filter(
    (timesheet) => timesheet.status === 'SUBMITTED'
  );

  return {
    data: pendingTimesheets,
    ...rest,
  };
}

// Hook for creating a timesheet
export function useTimesheetCreate() {
  const queryClient = useQueryClient();

  return useMutation<TimesheetResponse, Error, CreateTimesheetRequest>({
    mutationFn: async (data) => {
      return await apiFetch<TimesheetResponse>('/api/admin/timesheets', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      // Invalidate timesheets list
      queryClient.invalidateQueries({ queryKey: ['/api/admin/timesheets'] });
    },
  });
}

// Hook for updating timesheet status (approve/reject)
export function useTimesheetUpdate() {
  const queryClient = useQueryClient();

  return useMutation<TimesheetResponse, Error, { id: string; status: 'APPROVED' | 'REJECTED'; reason?: string }>({
    mutationFn: async ({ id, status, reason }) => {
      return await apiFetch<TimesheetResponse>(`/api/admin/timesheets/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status, reason }),
      });
    },
    onSuccess: () => {
      // Invalidate timesheets list
      queryClient.invalidateQueries({ queryKey: ['/api/admin/timesheets'] });
    },
  });
}

// Hook for fetching timesheets for a specific employee
export function useEmployeeTimesheets(employeeId: string) {
  return useQuery<Timesheet[]>({
    queryKey: ['/api/admin/timesheets', employeeId],
    queryFn: async () => {
      return await apiFetch<Timesheet[]>(`/api/admin/timesheets?employeeId=${employeeId}`);
    },
    enabled: !!employeeId,
  });
}
