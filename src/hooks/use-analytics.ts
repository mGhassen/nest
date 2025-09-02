import { useQuery } from "@tanstack/react-query";
import { analyticsApi, type AnalyticsData } from "@/lib/api";

// Hook for fetching analytics data
export function useAnalytics() {
  return useQuery<AnalyticsData>({
    queryKey: ['analytics'],
    queryFn: analyticsApi.getAnalyticsData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}