import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    // Check for Authorization header first
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    
    console.log('Session API called, token:', token ? 'present' : 'missing');
    
    const supabase = supabaseServer();
    let session = null;
    let sessionError = null;
    
    if (token) {
      // Validate token directly
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      
      if (userError || !user) {
        console.log('Token validation failed:', userError);
        return NextResponse.json({
          success: false,
          error: 'Invalid token',
        }, { status: 401 });
      }
      
      // Create a mock session object for consistency
      session = { user };
    } else {
      // Fallback to cookie-based session
      const { data: { session: cookieSession }, error: cookieError } = await supabase.auth.getSession();
      session = cookieSession;
      sessionError = cookieError;
    }
    
    if (sessionError) {
      console.log('Session error:', sessionError);
      return NextResponse.json({
        success: false,
        error: 'Session error',
      }, { status: 401 });
    }
    
    if (!session?.user) {
      console.log('No valid session found');
      return NextResponse.json({
        success: false,
        error: 'No valid session',
      }, { status: 401 });
    }

    const user = session.user;
    console.log('Session validated, user ID:', user.id);

    // Get user profile
    const { data: userData, error: dbError } = await supabase
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

    // Return user info
    const userResponse = {
      id: userData.id,
      email: user.email || '',
      isAdmin: ['OWNER', 'HR', 'MANAGER'].includes(userData.role),
      firstName: userData.first_name || user.email?.split('@')[0] || 'User',
      lastName: userData.last_name || '',
      status: userData.is_active ? 'active' : 'inactive',
      role: userData.role === 'EMPLOYEE' ? 'member' : 'admin',
    };

    console.log('Session API returning user:', userResponse.id);
    return NextResponse.json({
      success: true,
      user: userResponse,
    });
  } catch (error: any) {
    console.error('Session API unexpected error:', error);
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred during session check',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 