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

    // Get dashboard data
    const [
      { count: totalEmployees },
      { count: pendingTimesheets },
      { count: pendingLeaveRequests },
      { data: recentActivities }
    ] = await Promise.all([
      supabase.from('accounts').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('timesheets').select('*', { count: 'exact', head: true }).eq('status', 'SUBMITTED'),
      supabase.from('leave_requests').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
      supabase.from('audit_logs').select(`
        *,
        accounts!audit_logs_actor_id_fkey (
          first_name,
          last_name
        )
      `).order('created_at', { ascending: false }).limit(10)
    ]);

    const dashboardData = {
      stats: {
        totalEmployees: totalEmployees || 0,
        pendingTimesheets: pendingTimesheets || 0,
        pendingLeaveRequests: pendingLeaveRequests || 0,
        payrollStatus: 'Ready'
      },
      recentActivities: recentActivities || []
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
