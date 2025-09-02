import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { timesheetsApi, type Timesheet, type CreateTimesheetData } from "@/lib/api";
import { useAuth } from "./use-auth";

// Hook for fetching timesheets
export function useTimesheets() {
  const { user, isAuthenticated } = useAuth();
  
  return useQuery<Timesheet[]>({
    queryKey: ['timesheets'],
    queryFn: timesheetsApi.getTimesheets,
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

// Hook for creating a timesheet
export function useTimesheetCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: timesheetsApi.createTimesheet,
    onSuccess: () => {
      // Invalidate and refetch timesheets list
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
    },
  });
}