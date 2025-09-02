import { useQuery } from "@tanstack/react-query";
import { healthApi, type HealthStatus } from "@/lib/api";

// Hook for fetching health status
export function useHealthStatus() {
  return useQuery<HealthStatus>({
    queryKey: ['health'],
    queryFn: healthApi.getHealthStatus,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}
