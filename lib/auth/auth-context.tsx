'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database.types'
import type { UserRole } from '@/types/database.types';
import { useRouter } from 'next/navigation';
import { signInWithEmail, signUp, signOut } from '../auth';

interface UserProfile {
  id: string
  email: string
  role: UserRole
  first_name?: string | null
  last_name?: string | null
  profile_image_url?: string | null
};

type AuthContextType = {
  user: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  resetPassword: (params: { email?: string; token?: string; newPassword?: string }) => Promise<{ error: any }>;
  verifyOtp: (params: { token: string; type: string }) => Promise<{ data: any; error: any }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient<Database>()
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session check:', session);
        
        if (session?.user && mounted) {
          // Get user profile with role
          const { data: profile, error } = await supabase
            .from('accounts')
            .select('*')
            .eq('auth_user_id', session.user.id)
            .single();

          console.log('Profile lookup result:', { profile, error });

          if (profile && mounted) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              role: profile.role || 'EMPLOYEE',
              first_name: profile.first_name || null,
              last_name: profile.last_name || null,
              profile_image_url: profile.profile_image_url || null
            });
            console.log('User set successfully:', profile);
          } else if (error && mounted) {
            console.error('Profile not found by auth_user_id, trying by email...');
            // Try to find profile by email instead
            const { data: profileByEmail, error: emailError } = await supabase
              .from('accounts')
              .select('*')
              .eq('email', session.user.email)
              .single();
            
            if (profileByEmail && mounted) {
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                role: profileByEmail.role || 'EMPLOYEE',
                first_name: profileByEmail.first_name || null,
                last_name: profileByEmail.last_name || null,
                profile_image_url: profileByEmail.profile_image_url || null
              });
              console.log('User set successfully by email lookup:', profileByEmail);
            } else {
              console.error('Profile not found by email either:', emailError);
              // Set user with basic info even if profile not found
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                role: 'EMPLOYEE',
                first_name: null,
                last_name: null,
                profile_image_url: null
              });
            }
          }
        } else if (mounted) {
          console.log('No session found, setting user to null');
          setUser(null);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (mounted) setUser(null);
      } finally {
        if (mounted) {
          console.log('Setting isLoading to false');
          setIsLoading(false);
        }
      }
    };
    
    getInitialSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        if (!mounted) return;
        
        try {
          if (session?.user) {
            // Get user profile with role
            const { data: profile, error } = await supabase
              .from('accounts')
              .select('*')
              .eq('auth_user_id', session.user.id)
              .single();

            if (profile && mounted) {
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                role: profile.role || 'EMPLOYEE',
                first_name: profile.first_name || null,
                last_name: profile.last_name || null,
                profile_image_url: profile.profile_image_url || null
              });
            } else if (mounted) {
              // Try to find profile by email instead
              const { data: profileByEmail, error: emailError } = await supabase
                .from('accounts')
                .select('*')
                .eq('email', session.user.email)
                .single();
              
              if (profileByEmail && mounted) {
                setUser({
                  id: session.user.id,
                  email: session.user.email || '',
                  role: profileByEmail.role || 'EMPLOYEE',
                  first_name: profileByEmail.first_name || null,
                  last_name: profileByEmail.last_name || null,
                  profile_image_url: profileByEmail.profile_image_url || null
                });
              }
            }
          } else if (mounted) {
            setUser(null);
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
          if (mounted) setUser(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [supabase]);

  const handleSignIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await signInWithEmail(email, password);
      if (error) throw error;
      
      // Get the user's profile to determine redirect
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabase
          .from('accounts')
          .select('role')
          .eq('auth_user_id', authUser.id)
          .single();
        
        if (profile) {
          // Redirect based on role
          if (['OWNER', 'HR', 'MANAGER'].includes(profile.role)) {
            router.push('/admin/dashboard');
          } else {
            router.push('/employee/dashboard');
          }
        } else {
          // Try to find profile by email
          const { data: profileByEmail } = await supabase
            .from('accounts')
            .select('role')
            .eq('email', authUser.email)
            .single();
          
          if (profileByEmail) {
            if (['OWNER', 'HR', 'MANAGER'].includes(profileByEmail.role)) {
              router.push('/admin/dashboard');
            } else {
              router.push('/employee/dashboard');
            }
          } else {
            // Fallback redirect
            router.push('/employee/dashboard');
          }
        }
      }
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await signUp(email, password);
      if (error) throw error;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (params: { email?: string; token?: string; newPassword?: string }) => {
    try {
      if (params.token && params.newPassword) {
        // Complete password reset
        const { error } = await supabase.auth.updateUser({
          password: params.newPassword,
        });
        return { error };
      } else if (params.email) {
        // Request password reset
        const { error } = await supabase.auth.resetPasswordForEmail(params.email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });
        return { error };
      }
      return { error: { message: 'Invalid parameters' } };
    } catch (error) {
      console.error('Error in password reset:', error);
      return { error };
    }
  };

  const handleVerifyOtp = async (params: { token: string; type: string }) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: params.token,
        type: params.type as any,
      });
      return { data, error };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return { data: null, error };
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      setUser(null);
      router.push('/auth/signin');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn: handleSignIn,
        signInWithGoogle: handleSignInWithGoogle,
        signOut: handleSignOut,
        signUp: handleSignUp,
        resetPassword: handleResetPassword,
        verifyOtp: handleVerifyOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
