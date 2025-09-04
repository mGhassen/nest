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
    is_admin: boolean;
    is_active: boolean;
    joined_at: string;
  }>;
  currentCompany?: {
    company_id: string;
    company_name: string;
    is_admin: boolean;
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
  authError: string | null;
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
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch user session
  const fetchSession = async (token: string) => {
    try {
      const response = await fetch('/api/auth/session', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          setAuthToken(null);
          localStorage.removeItem('refresh_token');
          setUser(null);
          return null;
        }
        return null;
      }

      const data = await response.json();
      
      if (data.success && data.user) {
        setUser(data.user);
        setAuthError(null);
        return data.user;
      }
      return null;
    } catch (error) {
      console.error('Session fetch error:', error);
      setAuthError('Authentication error occurred');
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

      setAuthToken(token);
      const user = await fetchSession(token);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Refresh the current session
  const refreshSession = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    return fetchSession(token);
  };

  const login = async (email: string, password: string) => {
    if (isLoggingIn) return;
    
    setIsLoggingIn(true);
    setLoginError(null);
    setAuthError(null);

    try {
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
      
      if (!response.ok || !data.success) {
        if (response.status === 403) {
          if (data.error && data.error.toLowerCase().includes('archived')) {
            localStorage.setItem('account_status_email', email);
            router.push(`/auth/account-status?email=${encodeURIComponent(email)}`);
            return;
          }
          if (data.error && data.error.toLowerCase().includes('pending')) {
            localStorage.setItem('account_status_email', email);
            router.push(`/auth/account-status?email=${encodeURIComponent(email)}`);
            return;
          }
          if (data.error && data.error.toLowerCase().includes('suspended')) {
            localStorage.setItem('account_status_email', email);
            router.push(`/auth/account-status?email=${encodeURIComponent(email)}`);
            return;
          }
          const errorMsg = data.error || 'Account access denied';
          setLoginError(new Error(errorMsg));
          setAuthError(errorMsg);
          return;
        }
        
        if (response.status === 401) {
          if (data.error && (data.error.toLowerCase().includes('pending') || data.error.toLowerCase().includes('archived'))) {
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
        const errorMsg = 'No access token received';
        setLoginError(new Error(errorMsg));
        setAuthError(errorMsg);
        return;
      }

      // Store tokens
      setAuthToken(data.session.access_token);
      if (data.session.refresh_token) {
        localStorage.setItem('refresh_token', data.session.refresh_token);
      }

      // Clean up any pending email
      localStorage.removeItem('pending_email');
      localStorage.removeItem('pending_approval_email');
      localStorage.removeItem('account_status_email');

      // Set user data
      if (!data.user) {
        setLoginError(new Error('Failed to load user profile'));
        return;
      }

      setUser(data.user);
      setLoginError(null);
      setAuthError(null);

      // Redirect based on user role
      const hasNoCompanies = !data.user.companies || data.user.companies.length === 0;
      
      if (data.user.role === 'SUPERUSER' && hasNoCompanies) {
        window.location.href = '/admin/onboarding';
      } else if (data.user.role === 'SUPERUSER' || data.user.role === 'ADMIN') {
        window.location.href = '/admin/dashboard';
      } else {
        window.location.href = '/employee/dashboard';
      }
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
      setAuthToken(null);
      localStorage.removeItem('refresh_token');
      setUser(null);
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
    authError,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}