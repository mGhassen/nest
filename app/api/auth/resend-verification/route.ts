import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email } = await request.json()
  
  if (!email) {
    return NextResponse.json(
      { error: 'Email is required' },
      { status: 400 }
    )
  }

  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${request.headers.get('origin')}/auth/callback`,
      },
    })

    if (error) {
      console.error('Error resending verification email:', error)
      return NextResponse.json(
        { error: error.message },
        { status: error.status || 500 }
      )
    }

    return NextResponse.json({ message: 'Verification email sent successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
