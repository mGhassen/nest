import { apiFetch } from '../api';
import type { Employee, Account } from '@/types/schema';

// Extended employee type that includes account information
export type EmployeeWithAccount = Employee & {
  account?: Account | null;
};

// API response types
export interface PeopleListResponse {
  people: EmployeeWithAccount[];
  count: number;
}

export interface CreateEmployeeResponse {
  success: boolean;
  employee: Employee;
}

export interface EmployeeDetailResponse {
  success: boolean;
  employee: EmployeeWithAccount;
}

// Employee API service
export const employeeApi = {
  // Get all employees with account information
  async getEmployees(): Promise<EmployeeWithAccount[]> {
    const data = await apiFetch<PeopleListResponse>('/api/people');
    return data.people || [];
  },

  // Get a specific employee by ID
  async getEmployee(id: string): Promise<EmployeeWithAccount> {
    const data = await apiFetch<EmployeeDetailResponse>(`/api/people/${id}`);
    return data.employee;
  },

  // Create a new employee
  async createEmployee(employeeData: {
    first_name: string;
    last_name: string;
    email: string;
    hire_date: string;
    employment_type: "FULL_TIME" | "PART_TIME" | "CONTRACTOR" | "INTERN";
    position_title: string;
    location_id?: string;
    cost_center_id?: string;
    work_schedule_id?: string;
    manager_id?: string;
    base_salary: number;
    salary_period: "HOURLY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "YEARLY";
    status: "ACTIVE" | "INACTIVE" | "TERMINATED" | "ON_LEAVE";
  }): Promise<CreateEmployeeResponse> {
    return await apiFetch<CreateEmployeeResponse>('/api/people', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    });
  },

  // Update an employee
  async updateEmployee(id: string, employeeData: Partial<{
    first_name: string;
    last_name: string;
    email: string;
    hire_date: string;
    employment_type: "FULL_TIME" | "PART_TIME" | "CONTRACTOR" | "INTERN";
    position_title: string;
    location_id?: string;
    cost_center_id?: string;
    work_schedule_id?: string;
    manager_id?: string;
    base_salary: number;
    salary_period: "HOURLY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "YEARLY";
    status: "ACTIVE" | "INACTIVE" | "TERMINATED" | "ON_LEAVE";
  }>): Promise<CreateEmployeeResponse> {
    return await apiFetch<CreateEmployeeResponse>(`/api/people/${id}`, {
      method: 'PUT',
      body: JSON.stringify(employeeData),
    });
  },

  // Delete an employee
  async deleteEmployee(id: string): Promise<void> {
    await apiFetch(`/api/people/${id}`, {
      method: 'DELETE',
    });
  },

  // Send invitation to employee
  async sendInvitation(id: string, role: string = 'EMPLOYEE'): Promise<{ success: boolean; message: string; account?: any; authUser?: any }> {
    return await apiFetch(`/api/people/${id}/invite`, {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  },

  // Reset employee password
  async resetPassword(id: string): Promise<{ success: boolean; message: string }> {
    return await apiFetch(`/api/people/${id}/password/reset`, {
      method: 'POST',
    });
  },

  // Set employee password
  async setPassword(id: string, password: string): Promise<{ success: boolean; message: string }> {
    return await apiFetch(`/api/people/${id}/password`, {
      method: 'PATCH',
      body: JSON.stringify({ password }),
    });
  },
};
