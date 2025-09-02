import { useQuery } from "@tanstack/react-query";
import { debugApi, type DebugResponse } from "@/lib/api";

// Hook for fetching debug information
export function useDebugInfo() {
  return useQuery<DebugResponse>({
    queryKey: ['debug'],
    queryFn: debugApi.getDebugInfo,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}
