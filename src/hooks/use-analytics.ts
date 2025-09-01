import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

// Types for analytics data
interface AnalyticsData {
  totalEmployees: number;
  pendingTimesheets: number;
  leaveRequests: number;
  totalPayroll: number;
  departments: Array<{
    name: string;
    count: number;
  }>;
  recentHires: Array<{
    id: string;
    name: string;
    department: string;
    hireDate: string;
  }>;
}

interface DashboardStats {
  totalEmployees: number;
  pendingTimesheets: number;
  leaveRequests: number;
  totalPayroll: number;
}

// Hook for fetching analytics data
export function useAnalytics() {
  return useQuery<AnalyticsData>({
    queryKey: ['/api/admin/analytics'],
    queryFn: async () => {
      return await apiFetch<AnalyticsData>('/api/admin/analytics');
    },
  });
}

// Hook for fetching dashboard stats (simplified version)
export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['/api/admin/analytics'],
    queryFn: async () => {
      const data = await apiFetch<AnalyticsData>('/api/admin/analytics');
      return {
        totalEmployees: data.totalEmployees,
        pendingTimesheets: data.pendingTimesheets,
        leaveRequests: data.leaveRequests,
        totalPayroll: data.totalPayroll,
      };
    },
  });
}
