import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

export interface AuthUser {
  id: string
  email: string
  role: string
  companyId: string | null
}

export async function requireAuth(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const supabase = createRouteHandlerClient<Database>({ cookies })
  
  // Get the session
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session || !session.user) {
    // Redirect to login page if not authenticated
    const loginUrl = new URL('/auth/signin', request.url)
    loginUrl.searchParams.set('redirectedFrom', requestUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // Get the user's profile to get their role and company
  const { data: profile, error } = await supabase
    .from('accounts')
    .select('role, company_id')
    .eq('id', session.user.id)
    .single()
  
  if (error || !profile) {
    console.error('Error fetching user profile:', error)
    const loginUrl = new URL('/auth/signin', request.url)
    loginUrl.searchParams.set('error', 'Could not load your profile')
    return NextResponse.redirect(loginUrl)
  }
  
  return { 
    session, 
    user: {
      id: session.user.id,
      email: session.user.email || '',
      role: profile.role,
      companyId: profile.company_id
    } as AuthUser
  }
}

export async function requireRole(role: string, request: NextRequest) {
  const auth = await requireAuth(request)
  
  if (auth instanceof NextResponse) {
    return auth
  }
  
  // Check if the user has the required role
  if (auth.user.role !== role) {
    return new NextResponse('Forbidden', { status: 403 })
  }
  
  return auth
}
