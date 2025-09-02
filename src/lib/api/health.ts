import { apiFetch } from '../api';

// Health types
export interface HealthStatus {
  status: string;
  database: string;
  timestamp: string;
  supabaseConnected: boolean;
}

// Health API service
export const healthApi = {
  // Get health status
  async getHealthStatus(): Promise<HealthStatus> {
    return await apiFetch<HealthStatus>('/api/health');
  },
};
