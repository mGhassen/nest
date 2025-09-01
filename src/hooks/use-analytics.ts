import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

// Types for analytics data
interface AnalyticsData {
  totalEmployees: number;
  pendingTimesheets: number;
  pendingLeaveRequests: number;
  departmentStats: Array<{
    name: string;
    employeeCount: number;
    completionRate: number;
  }>;
}

interface DashboardStats {
  totalEmployees: number;
  pendingTimesheets: number;
  pendingLeaveRequests: number;
  totalPayroll: number;
}

// Hook for fetching analytics data
export function useAnalytics() {
  return useQuery<AnalyticsData>({
    queryKey: ['/api/analytics'],
    queryFn: async () => {
      return await apiFetch<AnalyticsData>('/api/analytics');
    },
  });
}

// Hook for fetching dashboard stats (simplified version)
export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['/api/analytics'],
    queryFn: async () => {
      const data = await apiFetch<AnalyticsData>('/api/analytics');
      return {
        totalEmployees: data.totalEmployees,
        pendingTimesheets: data.pendingTimesheets,
        pendingLeaveRequests: data.pendingLeaveRequests,
        totalPayroll: 0, // API doesn't provide this, using default
      };
    },
  });
}
