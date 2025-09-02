import { apiFetch } from '../api';

// Account types
export interface Account {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'ADMIN' | 'EMPLOYEE';
  account_status?: 'ACTIVE' | 'PENDING_SETUP' | 'PASSWORD_RESET_PENDING' | 'PASSWORD_RESET_COMPLETED' | 'SUSPENDED' | 'INACTIVE';
  is_active: boolean;
  last_login: string | null;
  password_reset_requested_at?: string | null;
  password_reset_completed_at?: string | null;
  last_password_change_at?: string | null;
  failed_login_attempts?: number;
  locked_until?: string | null;
  created_at: string;
  updated_at: string;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    position_title: string;
    status: string;
  };
}

// API response types
export interface AccountsListResponse {
  data: Account[];
  count: number;
}

export interface CreateAccountResponse {
  success: boolean;
  message: string;
}

export interface AccountActionResponse {
  success: boolean;
  message: string;
}

// Account API service
export const accountApi = {
  // Get all accounts
  async getAccounts(): Promise<Account[]> {
    const data = await apiFetch<AccountsListResponse>('/api/admin/accounts');
    return data.data || [];
  },

  // Create a new account
  async createAccount(accountData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: 'ADMIN' | 'EMPLOYEE';
  }): Promise<CreateAccountResponse> {
    return await apiFetch<CreateAccountResponse>('/api/admin/accounts', {
      method: 'POST',
      body: JSON.stringify(accountData),
    });
  },

  // Update account status
  async updateAccountStatus(accountId: string, status: string): Promise<AccountActionResponse> {
    return await apiFetch<AccountActionResponse>(`/api/admin/accounts/${accountId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Get account events
  async getAccountEvents(accountId: string): Promise<{ success: boolean; data: any[] }> {
    return await apiFetch(`/api/admin/accounts/${accountId}/events`);
  },

  // Reset password (send email)
  async resetPassword(accountId: string): Promise<{ success: boolean; message: string; data?: any }> {
    return await apiFetch(`/api/admin/accounts/${accountId}/password`, {
      method: 'POST',
    });
  },

  // Set password directly
  async setPassword(accountId: string, password: string): Promise<{ success: boolean; message: string; data?: any }> {
    return await apiFetch(`/api/admin/accounts/${accountId}/password`, {
      method: 'PATCH',
      body: JSON.stringify({ password }),
    });
  },

  // Employee-Account Management Methods

  // Send invitation to employee (creates account)
  async sendInvitation(employeeId: string, role: string = 'EMPLOYEE'): Promise<{ success: boolean; message: string; data?: any }> {
    return await apiFetch(`/api/admin/accounts/invite-employee`, {
      method: 'POST',
      body: JSON.stringify({ employeeId, role }),
    });
  },

  // Link employee to existing account
  async linkAccount(employeeId: string, accountId: string): Promise<{ success: boolean; message: string; data?: any }> {
    return await apiFetch(`/api/admin/accounts/${accountId}/link-employee`, {
      method: 'POST',
      body: JSON.stringify({ employeeId }),
    });
  },

  // Unlink employee from account
  async unlinkAccount(accountId: string): Promise<{ success: boolean; message: string; data?: any }> {
    return await apiFetch(`/api/admin/accounts/${accountId}/unlink-employee`, {
      method: 'POST',
    });
  },
};
