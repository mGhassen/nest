import { getAuthToken, setAuthToken } from '../api';

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  session?: {
    access_token: string;
    refresh_token?: string;
  };
  userId?: string;
}

export interface CheckStatusResponse {
  success: boolean;
  status: string;
  authStatus: string;
  email: string;
  firstName: string;
  lastName: string;
  message: string;
  error?: string;
}

// Auth API service
export const authApi = {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    
    if (!response.ok) {
      const error = new Error(data.error || 'Login failed');
      (error as any).status = response.status;
      throw error;
    }
    
    if (data.success && data.session?.access_token) {
      localStorage.setItem('access_token', data.session.access_token);
      if (data.session.refresh_token) {
        localStorage.setItem('refresh_token', data.session.refresh_token);
      }
      window.__authToken = data.session.access_token;
    }
    
    return data;
  },

  // Register new user
  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      const error = new Error(data.error || 'Registration failed');
      (error as any).status = response.status;
      throw error;
    }
    
    return data;
  },

  // Resend confirmation email
  async resendConfirmation(email: string): Promise<AuthResponse> {
    const response = await fetch('/api/auth/resend-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      const error = new Error(data.error || 'Failed to resend confirmation');
      (error as any).status = response.status;
      throw error;
    }
    
    return data;
  },

  // Reset password
  async resetPassword(email: string): Promise<AuthResponse> {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      const error = new Error(data.error || 'Failed to send password reset');
      (error as any).status = response.status;
      throw error;
    }
    
    return data;
  },

  // Check account status
  async checkStatus(email: string): Promise<CheckStatusResponse> {
    const response = await fetch('/api/auth/check-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      const error = new Error(data.error || 'Failed to check status');
      (error as any).status = response.status;
      throw error;
    }
    
    return data;
  },
  
  async getSession() {
    // Get the stored token
    const token = getAuthToken();
    if (!token) return null;
    
    try {
      const response = await fetch('/api/auth/session', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Try to refresh the token if we get a 401
          await authApi.refreshToken();
          const newToken = getAuthToken();
          if (!newToken) throw new Error('Failed to refresh token');
          
          // Retry with new token
          const retryResponse = await fetch('/api/auth/session', {
            headers: {
              'Authorization': `Bearer ${newToken}`,
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          });
          
          if (!retryResponse.ok) {
            throw new Error('Failed to get session after refresh');
          }
          
          return await retryResponse.json();
        }
        throw new Error(`Failed to get session: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Session check failed:', error);
      // Clear invalid token
      setAuthToken(null);
      throw error;
    }
  },
  
  async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) throw new Error('No refresh token available');
    
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken })
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }
      
      const data = await response.json();
      
      if (data.access_token) {
        setAuthToken(data.access_token);
        localStorage.setItem('access_token', data.access_token);
        
        // Update refresh token if a new one was provided
        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token);
        }
      }
      
      return data;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear tokens on refresh failure
      setAuthToken(null);
      localStorage.removeItem('refresh_token');
      throw error;
    }
  },
  
  async logout() {
    try {
      // Call server-side logout with credentials
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include', // Important for session cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all auth state
      setAuthToken(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // Force a full page reload to clear any in-memory state
      window.location.href = '/login';
    }
  },
};
