import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();
    
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

    // Validate status
    const validStatuses = ['ACTIVE', 'SUSPENDED', 'INACTIVE'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid status. Must be one of: ACTIVE, SUSPENDED, INACTIVE',
      }, { status: 400 });
    }

    // Get the current account
    const { data: account, error: accountError } = await supabaseServer()
      .from('accounts')
      .select('*')
      .eq('id', id)
      .single();

    if (accountError || !account) {
      return NextResponse.json({
        success: false,
        error: 'Account not found',
      }, { status: 404 });
    }

    const oldStatus = account.account_status;

    // Update account status
    const { error: updateError } = await supabaseServer()
      .from('accounts')
      .update({
        account_status: status,
        is_active: status === 'ACTIVE',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating account status:', updateError);
      return NextResponse.json({
        success: false,
        error: 'Failed to update account status',
        details: updateError.message,
      }, { status: 500 });
    }

    // Log the status change event
    try {
      await supabaseServer()
        .from('account_events')
        .insert({
          account_id: id,
          event_type: 'ACCOUNT_STATUS_CHANGED',
          event_status: 'SUCCESS',
          description: `Account status changed from ${oldStatus} to ${status} by admin ${userProfile.first_name} ${userProfile.last_name}`,
          metadata: {
            old_status: oldStatus,
            new_status: status,
            changed_by: userProfile.id,
            changed_by_email: userProfile.email,
            ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
            user_agent: request.headers.get('user-agent')
          }
        });
    } catch (logError) {
      console.error('Error logging status change event:', logError);
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      success: true,
      message: `Account status updated to ${status}`,
      old_status: oldStatus,
      new_status: status
    });

  } catch (error: unknown) {
    console.error('Admin account status API error:', error);
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred while updating account status',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
