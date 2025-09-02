import { useQuery } from "@tanstack/react-query";
import { dashboardApi, type DashboardData } from "@/lib/api";

// Hook for fetching dashboard data
export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getDashboardData,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}
