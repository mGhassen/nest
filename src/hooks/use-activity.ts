import { useQuery } from "@tanstack/react-query";
import { activityApi, type Activity } from "@/lib/api";

// Hook for fetching activities
export function useActivities() {
  return useQuery<Activity[]>({
    queryKey: ['activities'],
    queryFn: activityApi.getActivities,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}
