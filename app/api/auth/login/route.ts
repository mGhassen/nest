import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    console.log('🔐 Login API called');
    
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password are required',
      }, { status: 400 });
    }

    const supabase = supabaseServer()
    
    // Simple authentication
    const { data: { session, user }, error } = await supabase.auth.signInWithPassword({
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

    console.log('✅ Login successful for:', email);
    
    // Return session and user info
    return NextResponse.json({
      success: true,
      session,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.user_metadata?.first_name || 'User',
        lastName: user.user_metadata?.last_name || '',
      }
    });
    
  } catch (error: any) {
    console.error('💥 Login error:', error);
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred during login',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 