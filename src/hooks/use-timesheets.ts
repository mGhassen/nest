import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { timesheetsApi, type Timesheet, type CreateTimesheetData } from "@/lib/api";

// Hook for fetching timesheets
export function useTimesheets() {
  return useQuery<Timesheet[]>({
    queryKey: ['timesheets'],
    queryFn: timesheetsApi.getTimesheets,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
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