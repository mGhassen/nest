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

    // Get analytics data
    const [
      { count: totalEmployees },
      { count: pendingTimesheets },
      { count: pendingLeaveRequests },
      { data: departments }
    ] = await Promise.all([
      supabase.from('user_profiles').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('timesheets').select('*', { count: 'exact', head: true }).eq('status', 'SUBMITTED'),
      supabase.from('leave_requests').select('*', { count: 'exact', head: true }).eq('status', 'SUBMITTED'),
      supabase.from('user_profiles').select('department').eq('is_active', true)
    ]);

    // Calculate department stats
    const departmentStats = departments?.reduce((acc: Record<string, number>, profile: { department?: string }) => {
      const dept = profile.department || 'Unassigned';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const analytics = {
      totalEmployees: totalEmployees || 0,
      pendingTimesheets: pendingTimesheets || 0,
      pendingLeaveRequests: pendingLeaveRequests || 0,
      departmentStats: Object.entries(departmentStats).map(([name, count]) => ({
        name,
        employeeCount: count,
        completionRate: Math.floor(Math.random() * 20) + 80 // Mock completion rate
      }))
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
