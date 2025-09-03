"use client";

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { setAuthToken } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isAdmin: boolean;
  status?: string;
  role?: 'SUPERUSER' | 'ADMIN' | 'EMPLOYEE';
  companyId?: string;
  // Multi-company support
  companies?: Array<{
    company_id: string;
    company_name: string;
    role: 'SUPERUSER' | 'ADMIN' | 'EMPLOYEE';
    is_active: boolean;
    joined_at: string;
  }>;
  currentCompany?: {
    company_id: string;
    company_name: string;
    role: 'SUPERUSER' | 'ADMIN' | 'EMPLOYEE';
  };
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isLoggingIn: boolean;
  loginError: Error | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  authError: string | null; // <-- Added
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<Error | null>(null);
  const [authError, setAuthError] = useState<string | null>(null); // NEW
  const router = useRouter();

  // Fetch user session
  const fetchSession = async (token: string) => {
    try {
      console.log('Fetching session with token:', token ? 'present' : 'missing');
      
      const response = await fetch('/api/auth/session', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      console.log('Session API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('Session API error response:', errorData);
        
        // Handle specific status codes
        if (response.status === 403) {
          // User is archived, suspended, or pending
          if (errorData.status === 'archived') {
            // Redirect to waiting approval page
            router.push('/auth/waiting-approval');
            setAuthError(errorData.error || 'Account pending approval');
            return null;
          }
          setAuthError(errorData.error || 'Account access denied');
          return null;
        }
        
        if (response.status === 401) {
          console.log('401 error - clearing tokens and redirecting to login');
          // Clear invalid token
          setAuthToken(null);
          localStorage.removeItem('refresh_token');
          setUser(null);
          router.push('/auth/login');
          setAuthError('Your session has expired or is invalid. Please log in again.');
          return null;
        }
        
        setAuthError(errorData.error || 'Failed to fetch session');
        return null;
      }

      const data = await response.json();
      console.log('Session API success response:', data);
      
      if (data.success && data.user) {
        setUser(data.user);
        setAuthError(null); // Clear any previous errors
        return data.user;
      }
      return null;
    } catch (error) {
      console.error('Session fetch error:', error);
      setAuthError(
        error instanceof Error && error.message.includes('expired')
          ? 'Your session has expired. Please log in again.'
          : 'An unexpected authentication error occurred. Please try again.'
      );
      return null;
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Ensure the token is available to apiFetch
      setAuthToken(token);

      try {
        const user = await fetchSession(token);
        if (!user) {
          // Session was invalid, tokens already cleared in fetchSession
          console.log('Session check failed - no user returned');
        }
      } catch (error) {
        console.error('Session check failed:', error);
        // Fallback cleanup in case fetchSession didn't handle it
        setAuthToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Refresh the current session
  const refreshSession = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    return fetchSession(token);
  };

  const login = async (email: string, password: string) => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      // 1. Login request
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      const data = await response.json();
      
      console.log('Login API response:', data);
      console.log('Session object:', data.session);
      
      if (!response.ok || !data.success) {
        // Handle specific status codes
        if (response.status === 403) {
          if (data.error && data.error.toLowerCase().includes('archived')) {
            // User is archived (pending admin approval)
            localStorage.setItem('account_status_email', email);
            router.push(`/auth/account-status?email=${encodeURIComponent(email)}`);
            return;
          }
          if (data.error && data.error.toLowerCase().includes('pending')) {
            // User is pending (needs to confirm invitation)
            localStorage.setItem('account_status_email', email);
            router.push(`/auth/account-status?email=${encodeURIComponent(email)}`);
            return;
          }
          if (data.error && data.error.toLowerCase().includes('suspended')) {
            // User is suspended
            localStorage.setItem('account_status_email', email);
            router.push(`/auth/account-status?email=${encodeURIComponent(email)}`);
            return;
          }
                  const errorMsg = data.error || 'Account access denied';
        setLoginError(new Error(errorMsg));
        setAuthError(errorMsg);
        return;
        }
        
        // Handle 401 errors (invalid credentials or user not found)
        if (response.status === 401) {
          // Check if it's a status-related error that should redirect
          if (data.error && (data.error.toLowerCase().includes('pending') || data.error.toLowerCase().includes('archived'))) {
            // This shouldn't happen with 401, but handle it gracefully
            if (data.error.toLowerCase().includes('archived')) {
              localStorage.setItem('account_status_email', email);
              router.push(`/auth/account-status?email=${encodeURIComponent(email)}`);
              return;
            }
            if (data.error.toLowerCase().includes('pending')) {
              localStorage.setItem('account_status_email', email);
              router.push(`/auth/account-status?email=${encodeURIComponent(email)}`);
              return;
            }
          }
          const errorMsg = data.error || 'Invalid email or password';
          setLoginError(new Error(errorMsg));
          setAuthError(errorMsg);
          return;
        }
        
        const errorMsg = data.error || 'Login failed';
        setLoginError(new Error(errorMsg));
        setAuthError(errorMsg);
        return;
      }

      if (!data.session || !data.session.access_token) {
        console.log('Session structure:', JSON.stringify(data.session, null, 2));
        const errorMsg = 'No access token received';
        setLoginError(new Error(errorMsg));
        setAuthError(errorMsg);
        return;
      }

      // 2. Store tokens using the utility function
      setAuthToken(data.session.access_token);
      if (data.session.refresh_token) {
        localStorage.setItem('refresh_token', data.session.refresh_token);
      }

      // Clean up any pending email
      localStorage.removeItem('pending_email');
      localStorage.removeItem('pending_approval_email');
      localStorage.removeItem('account_status_email');

      // 3. Set user data from response
      if (!data.user) {
        setLoginError(new Error('Failed to load user profile'));
        return;
      }
      setUser(data.user);
      setLoginError(null); // Clear any previous errors
      setAuthError(null); // Clear any previous auth errors

      // Redirect based on user role and company access
      console.log('Login successful, redirecting user:', data.user);
      console.log('User isAdmin value:', data.user.isAdmin);
      console.log('User role value:', data.user.role);
      console.log('User companies:', data.user.companies);
      
      // Small delay to ensure state is updated
      setTimeout(() => {
        // Check if superuser has no companies (should see onboarding)
        const hasNoCompanies = !data.user.companies || data.user.companies.length === 0;
        
        if (data.user.role === 'SUPERUSER' && hasNoCompanies) {
          console.log('Superuser with no companies, redirecting to onboarding');
          router.push('/admin/onboarding');
        } else if (data.user.isAdmin) {
          console.log('Redirecting admin to /admin/dashboard');
          router.push('/admin/dashboard');
        } else {
          console.log('Redirecting employee to /employee/dashboard');
          router.push('/employee/dashboard');
        }
      }, 100);
    } catch (error) {
      console.error('Login error:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      if (typeof window !== 'undefined') {
        delete window.__authToken;
      }
      setUser(null);
      const errorMsg = error instanceof Error ? error.message : String(error);
      setLoginError(error instanceof Error ? error : new Error(String(error)));
      setAuthError(errorMsg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        await fetch('/api/auth/logout', { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all auth-related data regardless of API call success
      setAuthToken(null);
      localStorage.removeItem('refresh_token');
      
      // Clear user state immediately
      setUser(null);
      
      // Redirect to login page
      router.push('/auth/login');
    }
  };

  const value: AuthState = {
    user: user ? { ...user } : null,
    isLoading,
    isAuthenticated: !!user,
    isLoggingIn,
    loginError,
    login,
    logout,
    refreshSession,
    authError, // <-- Added
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}