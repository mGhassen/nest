import { useQuery } from "@tanstack/react-query";
import { dashboardApi, type DashboardData } from "@/lib/api";
import { useAuth } from "./use-auth";

// Hook for fetching dashboard data
export function useDashboard() {
  const { user, isAuthenticated } = useAuth();
  
  return useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getDashboardData,
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
