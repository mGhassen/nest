import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    
    console.log('Session API called with token:', token ? 'present' : 'missing');
    
    if (!token) {
      console.log('No token provided in session API');
      return NextResponse.json({
        success: false,
        error: 'No token provided',
      }, { status: 401 });
    }

    // Get user from token
    console.log('Validating token with Supabase...');
    const { data: { user }, error: userError } = await supabaseServer().auth.getUser(token);
    
    if (userError) {
      console.log('Token validation error:', userError);
    }
    
    if (userError || !user) {
      console.log('Invalid or expired token');
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired token',
      }, { status: 401 });
    }

    console.log('Token validated, user ID:', user.id);

    // Get user profile
    const { data: userData, error: dbError } = await supabaseServer()
      .from('accounts')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (dbError) {
      console.log('Database error:', dbError);
    }

    if (dbError || !userData) {
      console.log('User profile not found for user ID:', user.id);
      return NextResponse.json({
        success: false,
        error: 'User profile not found',
        userId: user.id,
      }, { status: 404 });
    }

    console.log('User profile found, is_active:', userData.is_active);

    // Status checks
    if (!userData.is_active) {
      return NextResponse.json({
        success: false,
        error: 'Account is not active. Please contact support.',
        status: 'inactive',
      }, { status: 403 });
    }

    // Return user data
    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        email: user.email || '',
        isAdmin: userData.role === 'ADMIN',
        firstName: userData.first_name || user.email?.split('@')[0] || 'User',
        lastName: userData.last_name || '',
        status: userData.is_active ? 'active' : 'inactive',
        role: userData.role,
      },
    });
  } catch (error: unknown) {
    console.error('Session API error:', error);
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}