import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database.types';

export async function withAuthMiddleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/auth/signin';
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  return res;
}

export async function withAdminMiddleware(req: NextRequest) {
  const res = await withAuthMiddleware(req);
  if (res !== NextResponse.next()) return res;

  const supabase = createMiddlewareClient<Database>({ req, res });
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  return res;
}
