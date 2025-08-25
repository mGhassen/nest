import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/database.types'

const publicPaths = [
  '/auth/signin',
  '/auth/signup',
  '/auth/reset-password',
  '/auth/forgot-password',
  '/_next/static',
  '/_next/image',
  '/favicon.ico',
  '/api/auth',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
  
  // Skip middleware for public paths and API routes
  if (isPublicPath || pathname.startsWith('/api/') || pathname.startsWith('/_next/') || pathname === '/favicon.ico') {
    return NextResponse.next()
  }

  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req: request, res })
  
  try {
    // Refresh session if expired - required for Server Components
    const { data: { session } } = await supabase.auth.getSession()
    
    // Redirect to login if not authenticated
    if (!session) {
      const loginUrl = new URL('/auth/signin', request.url)
      loginUrl.searchParams.set('redirectedFrom', pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    // If user is signed in and trying to access an auth page, redirect to dashboard
    if (isPublicPath) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    return res
  } catch (error) {
    console.error('Auth middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|auth).*)',
  ],
}
