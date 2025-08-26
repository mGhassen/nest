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
      
      // Store user info in localStorage for persistence
      localStorage.setItem('nest_user', JSON.stringify(user));
      
      return user;
    } catch (error) {
      console.error('Session fetch error:', error);
      setAuthError('An unexpected authentication error occurred. Please try again.');
      return null;
    }
  };

  // Check for existing session on mount and set up auth listener
  useEffect(() => {
    const supabase = createSupabaseClient();
    
    // First, try to restore user from localStorage
    const storedUser = localStorage.getItem('nest_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsLoading(false);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('nest_user');
      }
    }

    // Set up Supabase auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        if (event === 'SIGNED_IN' && session) {
          console.log('User signed in, fetching profile...');
          await fetchSession();
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setUser(null);
          localStorage.removeItem('nest_user');
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log('Token refreshed, updating session...');
          await fetchSession();
        } else if (event === 'INITIAL_SESSION') {
          console.log('Initial session check...');
          if (session) {
            await fetchSession();
          }
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log('Found existing Supabase session, fetching user profile...');
          await fetchSession();
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

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Refresh the current session
  const refreshSession = async () => {
    await fetchSession();
  };

  const login = async (email: string, password: string) => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      // Use Supabase auth directly
      const supabase = createSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.session) {
        throw new Error('No session created');
      }

      // The auth state change listener will handle the rest
      console.log('Login successful, session created');
      
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    try {
      const supabase = createSupabaseClient();
      await supabase.auth.signOut();
      
      // Clear user state and localStorage
      setUser(null);
      localStorage.removeItem('nest_user');
      
      // Redirect to login page
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      setUser(null);
      localStorage.removeItem('nest_user');
      router.push('/auth/login');
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
    authError,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}