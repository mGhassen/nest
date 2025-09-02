import { apiFetch } from '../api';

// Timesheet types
export interface Timesheet {
  id: string;
  user_id: string;
  week_start_date: string;
  hours_worked: number;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  created_at: string;
  updated_at: string;
  user_profiles?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface CreateTimesheetData {
  week_start_date: string;
  hours_worked: number;
  status?: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
}

// Timesheets API service
export const timesheetsApi = {
  // Get all timesheets
  async getTimesheets(): Promise<Timesheet[]> {
    return await apiFetch<Timesheet[]>('/api/timesheets');
  },

  // Create a new timesheet
  async createTimesheet(timesheetData: CreateTimesheetData): Promise<Timesheet> {
    return await apiFetch<Timesheet>('/api/timesheets', {
      method: 'POST',
      body: JSON.stringify(timesheetData),
    });
  },
};
