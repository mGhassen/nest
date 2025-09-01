import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password are required',
      }, { status: 400 });
    }

    // First attempt authentication with Supabase
    const { data: { session, user }, error } = await supabaseServer().auth.signInWithPassword({
      email,
      password,
    });

    if (error || !session || !user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password',
        details: error?.message,
      }, { status: 401 });
    }

    // Now get user profile after successful authentication
    const { data: userProfile, error: profileError } = await supabaseServer()
      .from('accounts')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json({
        success: false,
        error: 'User account not found. Please sign up first.',
      }, { status: 401 });
    }

    // Check user status after successful authentication
    if (!userProfile.is_active) {
      return NextResponse.json({
        success: false,
        error: 'Account is not active. Please contact support.',
      }, { status: 403 });
    }

    // Return session and user info
    console.log('Login API returning session:', {
      access_token: session?.access_token ? 'present' : 'missing',
      refresh_token: session?.refresh_token ? 'present' : 'missing',
      expires_at: session?.expires_at,
    });
    
    return NextResponse.json({
      success: true,
      session,
      user: {
        id: userProfile.id,
        email: user.email || '',
        isAdmin: userProfile.role === 'ADMIN',
        firstName: userProfile.first_name || user.email?.split('@')[0] || 'User',
        lastName: userProfile.last_name || '',
        status: userProfile.is_active ? 'active' : 'inactive',
        role: userProfile.role,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred during login',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}