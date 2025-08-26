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
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
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
        if (session?.user && mounted) {
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
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        if (mounted) setIsLoading(false);
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
      router.refresh();
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
        signOut: handleSignOut,
        signUp: handleSignUp,
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
