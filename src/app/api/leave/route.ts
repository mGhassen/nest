import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase';
import { isCurrentUserAdmin } from '@/lib/auth';

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

    // Get user account to check if admin
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Check if user is admin (including SUPERUSER)
    const isAdmin = await isCurrentUserAdmin(account.id);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch leave requests
    const { data: leaveRequests, error } = await supabase
      .from('leave_requests')
      .select(`
        *,
        employees!leave_requests_employee_id_fkey (
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

    // Get user account
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const body = await request.json();
    const { start_date, end_date, leave_policy_id, days_requested, reason, status = 'PENDING' } = body;

    // Get the employee record for this user
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('id')
      .eq('account_id', account.id)
      .single();

    if (employeeError || !employee) {
      return NextResponse.json({ error: 'Employee record not found' }, { status: 404 });
    }

    // Create leave request
    const { data: leaveRequest, error } = await supabase
      .from('leave_requests')
      .insert({
        employee_id: employee.id,
        leave_policy_id,
        start_date,
        end_date,
        days_requested,
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
