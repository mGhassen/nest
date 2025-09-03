// Extend the Window interface to include our custom property
declare global {
  interface Window {
    __authToken?: string;
  }
}

// Helper to get the auth token
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.__authToken || localStorage.getItem('access_token');
}

// Session token helpers removed - using simplified company system

// Helper to set the auth token
export function setAuthToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  
  if (token) {
    window.__authToken = token;
    localStorage.setItem('access_token', token);
  } else {
    delete window.__authToken;
    localStorage.removeItem('access_token');
  }
}

// API client with auth headers
export async function apiFetch<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers);
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  // Ensure the URL starts with a slash and has the /api prefix
  const apiUrl = url.startsWith('/') ? url : `/${url}`;
  const fullUrl = apiUrl.startsWith('/api') ? apiUrl : `/api${apiUrl}`;
  
  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
      credentials: 'include', // Important for cookies if using them
    });
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
      // Clear invalid token
      setAuthToken(null);
      // Redirect to login with return URL
      const returnUrl = window.location.pathname + window.location.search;
      window.location.href = `/auth/login?returnTo=${encodeURIComponent(returnUrl)}`;
      throw new Error('Session expired. Please log in again.');
    }
    
    // Handle other error statuses
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText };
      }
      
      const error = new Error(errorData.message || 'Request failed');
      (error as any).status = response.status;
      (error as any).data = errorData;
      throw error;
    }
    
    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return null as unknown as T;
    }
    
    return response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Re-export all API services for backward compatibility
export { authApi, type LoginCredentials, type RegisterData, type AuthResponse, type CheckStatusResponse } from './api/auth';
export { accountApi, type Account } from './api/accounts';
export { employeeApi, type EmployeeWithAccount } from './api/employees';
export { dashboardApi, type DashboardData, type DashboardStats, type RecentActivity } from './api/dashboard';
export { analyticsApi, type AnalyticsData, type DepartmentStat } from './api/analytics';
export { activityApi, type Activity } from './api/activity';
export { timesheetsApi, type Timesheet, type CreateTimesheetData } from './api/timesheets';
export { leaveApi, type LeaveRequest, type CreateLeaveRequestData } from './api/leave';
export { healthApi, type HealthStatus } from './api/health';
export { debugApi, type DebugResponse } from './api/debug';
export { companiesApi, type Company, type UserCompany, type CurrentCompany, type CreateCompanyData } from './api/companies';
