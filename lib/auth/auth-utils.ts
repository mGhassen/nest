import { supabase } from '../auth';

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

export const checkUserRole = async (requiredRole: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;
  
  const { data: userData, error } = await supabase
    .from('accounts')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error || !userData) return false;
  // Type assertion since we know the shape of the data
  return (userData as { role: string }).role === requiredRole;
};

export const signOut = async () => {
  await supabase.auth.signOut();
};

export const requireAuth = async (requiredRole?: string) => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    return { user: null, redirect: '/auth/signin' };
  }

  if (requiredRole) {
    const hasRole = await checkUserRole(requiredRole);
    if (!hasRole) {
      return { user: null, redirect: '/unauthorized' };
    }
  }

  return { user: session.user, redirect: null };
};
