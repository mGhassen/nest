"use client";

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isAdmin: boolean;
  status?: string;
  role?: 'admin' | 'employee';
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
  recoverSession: () => Promise<boolean>;
  authError: string | null; // <-- Added
  cleanupTokens: () => void; // <-- Added
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
  const [sessionChecked, setSessionChecked] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Set mounted state to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Capture current URL for redirect after login
  useEffect(() => {
    if (mounted && !user && !isLoading) {
      const currentPath = window.location.pathname;
      // Don't capture auth pages or root
      if (!currentPath.startsWith('/auth') && currentPath !== '/') {
        console.log('Capturing redirect URL:', currentPath);
        setRedirectUrl(currentPath);
      }
    }
  }, [user, isLoading, mounted]);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Only run once per session
        if (sessionChecked) {
          console.log('Session already checked, skipping...');
          return;
        }
        
        console.log('Checking for existing session...');
        
        // Check if localStorage has the session data
        const storedSession = mounted ? 
          window.localStorage.getItem('nest.auth.token') : null;
        console.log('Stored session in localStorage:', storedSession ? 'Present' : 'Not found');
        
        if (storedSession) {
          try {
            const sessionData = JSON.parse(storedSession);
            console.log('Parsed session data:', sessionData);
            
            // Check if session is still valid (not expired)
            const now = Math.floor(Date.now() / 1000);
            console.log('Current time:', now, 'Session expires at:', sessionData.expires_at);
            
            if (sessionData.expires_at && sessionData.expires_at > now) {
              console.log('Session is valid, validating with API...');
              
              // Validate with our API
              const response = await fetch('/api/auth/session', {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${sessionData.access_token}`
                }
              });
              const result = await response.json();
              console.log('API validation result:', result);
              
              if (result.success && result.user) {
                console.log('Session validated with API, setting user data...', result.user);
                setUser(result.user);
                setAuthError(null);
                setSessionChecked(true);
                setIsLoading(false);
                console.log('User state set successfully:', result.user.email);
                return;
              } else {
                console.log('Session validation failed with API:', result.error);
                localStorage.removeItem('nest.auth.token');
                // Don't return here, continue to check Supabase client
              }
            } else {
              console.log('Session expired, removing from localStorage');
              localStorage.removeItem('nest.auth.token');
            }
          } catch (error) {
            console.error('Error parsing stored session:', error);
            localStorage.removeItem('nest.auth.token');
          }
        }
        
        // If no valid session found, check Supabase client as fallback
        const supabaseClient = supabase();
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          setAuthError('Session validation failed');
        } else if (session?.user) {
          console.log('User found in Supabase session:', session.user.email);
          await fetchUserProfile(session.user.id);
        } else {
          console.log('No user in session');
          setUser(null);
        }
        
        // Mark session as checked and stop loading
        setSessionChecked(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Session check error:', error);
        setAuthError('Failed to check session');
        setUser(null);
        setSessionChecked(true);
        setIsLoading(false);
      }
    };

    // Run session check immediately
    checkSession();

    // Listen for auth state changes
    const supabaseClient = supabase();
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event: string, session: any) => {
        console.log('Auth state change:', event, session?.user?.id, 'Current user:', user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Only fetch profile if we don't already have a user (avoid conflicts during login)
          if (!user) {
            console.log('No user in state, fetching profile for SIGNED_IN event');
            await fetchUserProfile(session.user.id);
          } else {
            console.log('User already exists, ignoring SIGNED_IN event to avoid conflicts');
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('SIGNED_OUT event, clearing user state');
          setUser(null);
          setAuthError(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('Token refreshed, updating user profile');
          await fetchUserProfile(session.user.id);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for ID:', userId);
      const supabaseClient = supabase();
      const { data: userProfile, error: profileError } = await supabaseClient
        .from('accounts')
        .select('*')
        .eq('auth_user_id', userId)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        setUser(null);
        setAuthError('Failed to fetch user profile');
        return;
      }

      if (!userProfile) {
        console.error('No user profile found');
        setUser(null);
        setAuthError('User profile not found');
        return;
      }

      if (!userProfile.is_active) {
        setUser(null);
        setAuthError('Account is not active');
        return;
      }

      // Simplified: Only admin or employee
      const isAdmin = userProfile.role === 'ADMIN';
      
      const userData: User = {
        id: userProfile.id,
        email: userProfile.email,
        firstName: userProfile.first_name,
        lastName: userProfile.last_name,
        isAdmin: isAdmin,
        role: isAdmin ? 'admin' : 'employee',
        status: userProfile.is_active ? 'active' : 'inactive'
      };

      setUser(userData);
      setAuthError(null);
      console.log('User profile loaded successfully:', userData.email);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser(null);
      setAuthError('Failed to load user profile');
    }
  };

  // Refresh the current session
  const refreshSession = async () => {
    try {
      console.log('Refreshing session...');
      const supabaseClient = supabase();
      const { data: { session }, error } = await supabaseClient.auth.getSession();
      
      if (error) {
        console.error('Session refresh error:', error);
        setAuthError('Failed to refresh session');
        return;
      }
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setAuthError('No valid session found');
      }
    } catch (error) {
      console.error('Session refresh error:', error);
      setAuthError('Failed to refresh session');
    }
  };

  const login = async (email: string, password: string) => {
    console.log('Login function called for:', email);
    setIsLoggingIn(true);
    setLoginError(null);
    setAuthError(null);
    
    try {
      // Use the API endpoint for authentication
      console.log('Attempting login via API...');
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error('Login API error:', result.error);
        const loginError = new Error(result.error || 'Login failed');
        setLoginError(loginError);
        setIsLoggingIn(false);
        throw loginError;
      }

      console.log('Login API successful:', result.user.email);

      // Clean up any pending email
      localStorage.removeItem('pending_email');
      localStorage.removeItem('pending_approval_email');
      localStorage.removeItem('account_status_email');

      // The API already returned the user profile data
      const userData = result.user;
      console.log('User data from API:', userData);
      
      // Store session data in localStorage for persistence
      console.log('Storing session in localStorage...');
      console.log('Session data to store:', result.session);
      localStorage.setItem('nest.auth.token', JSON.stringify(result.session));
      
      // Set user data
      console.log('Setting user data in state...');
      setUser(userData);
      setLoginError(null);
      setIsLoggingIn(false);
      console.log('Login completed successfully - user state updated');
      // The useEffect will handle the redirect based on user role

    } catch (error) {
      console.error('Login error:', error);
      const loginError = new Error('Login failed');
      setLoginError(loginError);
      throw loginError;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out...');
      const supabaseClient = supabase();
      await supabaseClient.auth.signOut();
      
      // Clear all localStorage tokens
      if (mounted) {
        console.log('🧹 Clearing all tokens from localStorage...');
        localStorage.removeItem('nest.auth.token');
        console.log('✅ All tokens cleared');
      }
      
      // Clear user state
      setUser(null);
      setAuthError(null);
      console.log('Logout completed');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Watch for user changes to handle redirects
  useEffect(() => {
    console.log('Redirect useEffect triggered - user:', user, 'isLoading:', isLoading, 'isLoggingIn:', isLoggingIn, 'redirectUrl:', redirectUrl);
    
    if (user && !isLoading) {
      // If user just logged in, redirect to intended page or default dashboard
      if (isLoggingIn) {
        console.log('User just logged in, redirecting...', 'isAdmin:', user.isAdmin);
        
        // Check if there's a stored redirect URL
        if (redirectUrl) {
          console.log('Redirecting to stored URL:', redirectUrl);
          router.push(redirectUrl);
          setRedirectUrl(null); // Clear the redirect URL
        } else {
          // Default redirect based on role
          if (user.isAdmin) {
            console.log('Redirecting to admin dashboard...');
            router.push('/admin/dashboard');
          } else {
            console.log('Redirecting to employee dashboard...');
            router.push('/employee/dashboard');
          }
        }
      }
      // If user is already authenticated (page reload), don't redirect
      // This prevents the redirect loop issue
    }
  }, [user, isLoading, isLoggingIn, redirectUrl, router]);

  // Manual session recovery function
  const recoverSession = async () => {
    try {
      console.log('Attempting manual session recovery...');
      
      // Check localStorage first
      const storedSession = mounted ? 
        window.localStorage.getItem('nest.auth.token') : null;
      
      if (storedSession) {
        try {
          const sessionData = JSON.parse(storedSession);
          const now = Math.floor(Date.now() / 1000);
          
          if (sessionData.expires_at && sessionData.expires_at > now) {
            console.log('Valid session found in localStorage, validating with API...');
            
            // Validate with API
            const response = await fetch('/api/auth/session', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${sessionData.access_token}`
              }
            });
            
            const result = await response.json();
            
            if (result.success && result.user) {
              console.log('Session recovered successfully via API');
              setUser(result.user);
              setAuthError(null);
              setSessionChecked(true);
              setIsLoading(false);
              return true;
            }
          }
        } catch (error) {
          console.error('Error parsing stored session during recovery:', error);
        }
      }
      
      // Fallback to Supabase client
      const supabaseClient = supabase();
      const { data: { session }, error } = await supabaseClient.auth.getSession();
      
      if (error) {
        console.error('Session recovery error:', error);
        return false;
      }
      
      if (session?.user) {
        console.log('Session recovered successfully via Supabase');
        await fetchUserProfile(session.user.id);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Session recovery failed:', error);
      return false;
    }
  };

  // Manual cleanup function for duplicate tokens
  const cleanupTokens = () => {
    if (mounted) {
      console.log('🧹 Manual token cleanup...');
      localStorage.removeItem('sb-127-auth-token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('supabase.auth.token'); // Clean up old key
      console.log('✅ Manual cleanup completed');
    }
  };

  const value: AuthState = {
    user: user ? { ...user, role: user.isAdmin ? 'admin' : 'employee' } as User & { role: 'admin' | 'employee' } : null,
    isLoading,
    isAuthenticated: !!user,
    isLoggingIn,
    loginError,
    login,
    logout,
    refreshSession,
    recoverSession,
    authError, // <-- Added
    cleanupTokens,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}