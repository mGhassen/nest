import { apiFetch } from '../api';

// Debug types
export interface DebugResponse {
  timestamp: string;
  user?: {
    id: string;
    email: string;
  } | null;
  environment: {
    hasSupabaseUrl: boolean;
    hasSupabaseAnonKey: boolean;
    hasSupabaseServiceKey: boolean;
    supabaseUrl: string;
    supabaseAnonKey: string;
    supabaseServiceKey: string;
  };
  authTest: {
    success: boolean;
    error: string | null;
    details: unknown;
  };
  companies: {
    data: any[];
    error: any;
    count: number;
  };
  accounts: {
    data: any[];
    error: any;
    count: number;
  };
  memberships: {
    data: any[];
    error: any;
    count: number;
  };
  employees: {
    data: any[];
    error: any;
    count: number;
  };
}

// Debug API service
export const debugApi = {
  // Get debug information
  async getDebugInfo(): Promise<DebugResponse> {
    return await apiFetch<DebugResponse>('/api/debug');
  },
};
