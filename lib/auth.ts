import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database.types';

// Server-side Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Client-side Supabase client
export const createClientSupabase = () => createClientComponentClient<Database>();

// Auth utility functions
export const isUnauthorizedError = (error: any): boolean => {
  return error?.status === 401 || error?.code === 'UNAUTHORIZED';
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

export const checkUserRole = async (userId: string, requiredRole: string) => {
  const { data: userData, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !userData) return false;
  return userData.role === requiredRole;
};

export const requireAuth = async (requiredRole?: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    return { user: null, redirect: '/auth/signin' };
  }

  if (requiredRole) {
    const hasRole = await checkUserRole(session.user.id, requiredRole);
    if (!hasRole) {
      return { user: null, redirect: '/unauthorized' };
    }
  }

  return { user: session.user, redirect: null };
};

// Auth actions
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  await supabase.auth.signOut();
};

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
    },
  });
  return { data, error };
};
