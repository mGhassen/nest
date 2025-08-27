"use client";

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'http://127.0.0.1:54421',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
);

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isAdmin: boolean;
  status?: string;
  role?: 'admin' | 'member';
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
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          if (typeof window !== 'undefined') {
            delete window.__authToken;
          }
          setUser(null);
          router.push('/login');
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

  // Check for existing session on mount - DISABLED to fix login flow
  useEffect(() => {
    // Don't auto-check session on mount - let login handle it
    setIsLoading(false);
  }, []);

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
      // Use Supabase client authentication directly
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Supabase auth error:', error);
        setLoginError(new Error(error.message));
        return;
      }

      if (!data.session || !data.user) {
        setLoginError(new Error('No session or user data received'));
        return;
      }

      console.log('Supabase login successful:', data.user.email);
      console.log('Session:', data.session);

      // Store tokens
      localStorage.setItem('access_token', data.session.access_token);
      if (data.session.refresh_token) {
        localStorage.setItem('refresh_token', data.session.refresh_token);
      }
      if (typeof window !== 'undefined') {
        window.__authToken = data.session.access_token;
      }

      // Clean up any pending email
      localStorage.removeItem('pending_email');
      localStorage.removeItem('pending_approval_email');
      localStorage.removeItem('account_status_email');

      // Get user profile from accounts table to determine role
      const { data: userProfile, error: profileError } = await supabase
        .from('accounts')
        .select('*')
        .eq('auth_user_id', data.user.id)
        .single();

      if (profileError || !userProfile) {
        console.error('Profile fetch error:', profileError);
        setLoginError(new Error('User profile not found'));
        return;
      }

      if (!userProfile.is_active) {
        setLoginError(new Error('Account is not active'));
        return;
      }

      const isAdmin = ['OWNER', 'HR', 'MANAGER'].includes(userProfile.role);
      
      // Set user data
      setUser({
        id: userProfile.id,
        email: userProfile.email,
        firstName: userProfile.first_name,
        lastName: userProfile.last_name,
        isAdmin: isAdmin,
        role: userProfile.role,
        status: userProfile.is_active ? 'active' : 'inactive'
      });

      setLoginError(null);

      // Redirect based on role
      if (isAdmin) {
        router.push('/admin/dashboard');
      } else {
        router.push('/employee/dashboard');
      }

    } catch (error) {
      console.error('Login error:', error);
      setLoginError(new Error('Login failed'));
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
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      if (typeof window !== 'undefined') {
        delete window.__authToken;
      }
      
      // Clear user state immediately
      setUser(null);
      
      // Redirect to login page
      router.push('/login');
    }
  };

  const value: AuthState = {
    user: user ? { ...user, role: user.isAdmin ? 'admin' : 'member' } as User & { role: 'admin' | 'member' } : null,
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