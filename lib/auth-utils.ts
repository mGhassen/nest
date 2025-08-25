import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database.types';

const supabase = createClientComponentClient<Database>();

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
