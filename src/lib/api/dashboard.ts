import { apiFetch } from '../api';

// Dashboard types
export interface DashboardStats {
  totalEmployees: number;
  pendingTimesheets: number;
  pendingLeaveRequests: number;
  payrollStatus: string;
}

export interface RecentActivity {
  id: string;
  type: string;
  description: string;
  created_at: string;
  user_profiles?: {
    first_name: string;
    last_name: string;
  };
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivities: RecentActivity[];
}

// Dashboard API service
export const dashboardApi = {
  // Get dashboard data
  async getDashboardData(): Promise<DashboardData> {
    return await apiFetch<DashboardData>('/api/dashboard');
  },
};
