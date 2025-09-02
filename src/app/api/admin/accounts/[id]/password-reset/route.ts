import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function POST(
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

    // Get the account to reset password for
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

    // Check if account has an auth user
    if (!account.auth_user_id) {
      return NextResponse.json({
        success: false,
        error: 'Account is not linked to an auth user.',
      }, { status: 400 });
    }

    // Send password reset email using Supabase
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const redirectTo = `${baseUrl}/auth/reset-password`;

    console.log('Admin sending password reset email to:', account.email);
    console.log('Redirect URL:', redirectTo);

    const { error: resetError } = await supabaseServer().auth.resetPasswordForEmail(
      account.email,
      {
        redirectTo: redirectTo,
      }
    );

    if (resetError) {
      console.error('Password reset error:', resetError);
      return NextResponse.json({
        success: false,
        error: 'Failed to send password reset email',
        details: resetError.message,
      }, { status: 500 });
    }

    // Update account status to PASSWORD_RESET_PENDING
    const { error: updateError } = await supabaseServer()
      .from('accounts')
      .update({
        account_status: 'PASSWORD_RESET_PENDING',
        password_reset_requested_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating account status:', updateError);
      // Don't fail the request, just log the error
    }

    // Log the password reset request event
    try {
      await supabaseServer()
        .from('account_events')
        .insert({
          account_id: id,
          event_type: 'PASSWORD_RESET_REQUESTED',
          event_status: 'SUCCESS',
          description: `Password reset email sent by admin ${userProfile.first_name} ${userProfile.last_name}`,
          metadata: {
            requested_by: userProfile.id,
            requested_by_email: userProfile.email,
            ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
            user_agent: request.headers.get('user-agent')
          }
        });
    } catch (logError) {
      console.error('Error logging password reset event:', logError);
      // Don't fail the request, just log the error
    }

    console.log('Password reset email sent successfully to:', account.email);

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent successfully',
      email: account.email
    });

  } catch (error: unknown) {
    console.error('Admin password reset API error:', error);
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred while sending password reset email',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
