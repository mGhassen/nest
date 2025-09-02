import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'No authorization token provided',
      }, { status: 401 });
    }

    // Verify the user is authenticated
    const { data: { user }, error: userError } = await supabaseServer().auth.getUser(token);
    
    if (userError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired token',
      }, { status: 401 });
    }

    // Get user profile to check if they're admin
    const { data: userProfile, error: profileError } = await supabaseServer()
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

    // Check if user is admin
    if (userProfile.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        error: 'Access denied. Admin privileges required.',
      }, { status: 403 });
    }

    // Fetch account events for the specified account
    const { data: events, error: eventsError } = await supabaseServer()
      .from('account_events')
      .select('*')
      .eq('account_id', id)
      .order('created_at', { ascending: false })
      .limit(100); // Limit to last 100 events

    if (eventsError) {
      console.error('Error fetching account events:', eventsError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch account events',
        details: eventsError.message,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: events
    });

  } catch (error: unknown) {
    console.error('Admin account events API error:', error);
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred while fetching account events',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
