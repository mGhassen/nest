import { apiFetch } from '../api';

// Analytics types
export interface DepartmentStat {
  name: string;
  employeeCount: number;
  completionRate: number;
}

export interface AnalyticsData {
  totalEmployees: number;
  pendingTimesheets: number;
  pendingLeaveRequests: number;
  departmentStats: DepartmentStat[];
}

// Analytics API service
export const analyticsApi = {
  // Get analytics data
  async getAnalyticsData(): Promise<AnalyticsData> {
    return await apiFetch<AnalyticsData>('/api/analytics');
  },
};
