import { apiFetch } from '../api';

// Activity types
export interface Activity {
  id: string;
  type: string;
  description: string;
  created_at: string;
  user_id: string;
  user_profiles?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

// Activity API service
export const activityApi = {
  // Get recent activities
  async getActivities(): Promise<Activity[]> {
    return await apiFetch<Activity[]>('/api/activity');
  },
};
