"use client";

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase';

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

  // Fetch user session using Supabase
  const fetchSession = async (token?: string) => {
    try {
      console.log('Fetching session with Supabase...');
      
      const supabase = createSupabaseClient();
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.log('Supabase session error:', error);
        setAuthError(error.message);
        return null;
      }
      
      if (!session) {
        console.log('No active Supabase session');
        setAuthError('No active session');
        return null;
      }
      
      console.log('Supabase session found, user ID:', session.user.id);
      
      // Get user profile from our database
      const { data: userProfile, error: profileError } = await supabase
        .from('accounts')
        .select('*')
        .eq('auth_user_id', session.user.id)
        .single();
      
      if (profileError || !userProfile) {
        console.log('User profile not found:', profileError);
        setAuthError('User profile not found');
        return null;
      }
      
      if (!userProfile.is_active) {
        console.log('User account not active');
        setAuthError('Account is not active. Please contact support.');
        return null;
      }
      
      // Create user object
      const user: User = {
        id: userProfile.id,
        email: session.user.email || '',
        isAdmin: ['OWNER', 'HR', 'MANAGER'].includes(userProfile.role),
        firstName: userProfile.first_name || session.user.email?.split('@')[0] || 'User',
        lastName: userProfile.last_name || '',
        status: userProfile.is_active ? 'active' : 'inactive',
        role: ['OWNER', 'HR', 'MANAGER'].includes(userProfile.role) ? 'admin' : 'member',
      };
      
      setUser(user);
      setAuthError(null);
      return user;
    } catch (error) {
      console.error('Session fetch error:', error);
      setAuthError('An unexpected authentication error occurred. Please try again.');
      return null;
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log('Found existing Supabase session, fetching user profile...');
          await fetchSession(); // Token not needed for Supabase session
        } else {
          console.log('No existing Supabase session found');
          setUser(null);
        }
      } catch (error) {
        console.error('Session check failed:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Refresh the current session
  const refreshSession = async () => {
    await fetchSession();
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
          setLoginError(new Error(data.error || 'Account access denied'));
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
          setLoginError(new Error(data.error || 'Invalid email or password'));
          return;
        }
        
        setLoginError(new Error(data.error || 'Login failed'));
        return;
      }

      // 2. Set user data from response
      if (!data.user) {
        setLoginError(new Error('Failed to load user profile'));
        return;
      }
      setUser(data.user);
      setLoginError(null); // Clear any previous errors
      
      // Clean up any pending email
      localStorage.removeItem('pending_email');
      localStorage.removeItem('pending_approval_email');
      localStorage.removeItem('account_status_email');
      
      // 3. Redirect based on user role
      if (data.user.isAdmin) {
        router.push('/admin/dashboard');
      } else {
        router.push('/employee/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      setUser(null);
      setLoginError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    try {
      const supabase = createSupabaseClient();
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
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