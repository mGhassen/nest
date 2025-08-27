import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Login API called');
    
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password are required',
      }, { status: 400 });
    }

    const supabase = supabaseServer();
    
    // Authenticate with Supabase
    const { data: { session, user }, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !session || !user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password',
      }, { status: 401 });
    }

    console.log('✅ Login successful for:', email);
    
    // Get user profile from accounts table to determine role
    const { data: userProfile, error: profileError } = await supabase
      .from('accounts')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json({
        success: false,
        error: 'User profile not found',
      }, { status: 404 });
    }

    if (!userProfile.is_active) {
      return NextResponse.json({
        success: false,
        error: 'Account is not active',
      }, { status: 403 });
    }

    const isAdmin = ['OWNER', 'HR', 'MANAGER'].includes(userProfile.role);
    
    // Return session and user info with role
    return NextResponse.json({
      success: true,
      session,
      user: {
        id: userProfile.id,
        email: userProfile.email,
        firstName: userProfile.first_name,
        lastName: userProfile.last_name,
        isAdmin: isAdmin,
        role: userProfile.role,
        status: userProfile.is_active ? 'active' : 'inactive'
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
} 