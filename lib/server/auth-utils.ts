import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';

export const createServerSupabaseClient = () => {
  return createServerComponentClient<Database>({ cookies });
};

export const getServerSession = async () => {
  const supabase = createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

export const requireServerAuth = async (requiredRole?: string) => {
  const supabase = createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    return { user: null, error: 'Unauthorized' };
  }

  if (requiredRole) {
    const { data: userData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (userData?.role !== requiredRole) {
      return { user: null, error: 'Forbidden' };
    }
  }

  return { user: session.user, error: null };
};
