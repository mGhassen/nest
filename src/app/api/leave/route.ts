import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServer();
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user profile to check if admin
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch leave requests
    const { data: leaveRequests, error } = await supabase
      .from('leave_requests')
      .select(`
        *,
        user_profiles!leave_requests_user_id_fkey (
          first_name,
          last_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching leave requests:', error);
      return NextResponse.json({ error: 'Failed to fetch leave requests' }, { status: 500 });
    }

    return NextResponse.json(leaveRequests || []);
  } catch (error) {
    console.error('Leave API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServer();
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { start_date, end_date, leave_type, reason, status = 'SUBMITTED' } = body;

    // Create leave request
    const { data: leaveRequest, error } = await supabase
      .from('leave_requests')
      .insert({
        user_id: user.id,
        start_date,
        end_date,
        leave_type,
        reason,
        status
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating leave request:', error);
      return NextResponse.json({ error: 'Failed to create leave request' }, { status: 500 });
    }

    return NextResponse.json(leaveRequest);
  } catch (error) {
    console.error('Leave API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
