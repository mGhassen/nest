import { apiFetch } from '../api';

// Leave types
export interface LeaveRequest {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  leave_type: string;
  reason: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  created_at: string;
  updated_at: string;
  user_profiles?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface CreateLeaveRequestData {
  start_date: string;
  end_date: string;
  leave_type: string;
  reason: string;
  status?: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
}

// Leave API service
export const leaveApi = {
  // Get all leave requests
  async getLeaveRequests(): Promise<LeaveRequest[]> {
    return await apiFetch<LeaveRequest[]>('/api/leave');
  },

  // Create a new leave request
  async createLeaveRequest(leaveData: CreateLeaveRequestData): Promise<LeaveRequest> {
    return await apiFetch<LeaveRequest>('/api/leave', {
      method: 'POST',
      body: JSON.stringify(leaveData),
    });
  },
};
