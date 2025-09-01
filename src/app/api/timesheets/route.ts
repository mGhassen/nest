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

    // Fetch timesheets
    const { data: timesheets, error } = await supabase
      .from('timesheets')
      .select(`
        *,
        user_profiles!timesheets_user_id_fkey (
          first_name,
          last_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching timesheets:', error);
      return NextResponse.json({ error: 'Failed to fetch timesheets' }, { status: 500 });
    }

    return NextResponse.json(timesheets || []);
  } catch (error) {
    console.error('Timesheets API error:', error);
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
      return NextResponse.json({ error: 'Invalid token' }, { status: 500 });
    }

    const body = await request.json();
    const { week_start_date, hours_worked, status = 'SUBMITTED' } = body;

    // Create timesheet
    const { data: timesheet, error } = await supabase
      .from('timesheets')
      .insert({
        user_id: user.id,
        week_start_date,
        hours_worked,
        status
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating timesheet:', error);
      return NextResponse.json({ error: 'Failed to create timesheet' }, { status: 500 });
    }

    return NextResponse.json(timesheet);
  } catch (error) {
    console.error('Timesheets API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
