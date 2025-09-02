import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: accountId } = await params;
    const { password } = await req.json();
    
    if (!password) {
      return NextResponse.json({
        success: false,
        error: 'Password is required'
      }, { status: 400 });
    }
    
    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Create Supabase client and verify the token
    const supabase = createSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user is admin
    const { data: adminAccount } = await supabase
      .from('accounts')
      .select('role')
      .eq('auth_user_id', user.id)
      .single();

    if (!adminAccount || adminAccount.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        error: 'Admin access required'
      }, { status: 403 });
    }

    // Get the account record
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (accountError || !account) {
      return NextResponse.json({
        success: false,
        error: 'Account not found'
      }, { status: 404 });
    }

    // Check if account has an auth user
    if (!account.auth_user_id) {
      return NextResponse.json({
        success: false,
        error: 'Account is not linked to an auth user'
      }, { status: 400 });
    }

    // Update the password using Supabase admin
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      account.auth_user_id,
      {
        password: password
      }
    );

    if (updateError) {
      console.error('Error updating password:', updateError);
      return NextResponse.json({
        success: false,
        error: 'Failed to update password',
        details: updateError.message,
      }, { status: 500 });
    }

    // Update account status and password change timestamp
    const { error: accountUpdateError } = await supabase
      .from('accounts')
      .update({
        account_status: 'ACTIVE',
        last_password_change_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', accountId);

    if (accountUpdateError) {
      console.error('Error updating account status:', accountUpdateError);
      // Don't fail the request, just log the error
    }

    // Log the password update event
    try {
      await supabase
        .from('account_events')
        .insert({
          account_id: accountId,
          event_type: 'PASSWORD_UPDATED_BY_ADMIN',
          event_status: 'SUCCESS',
          description: `Password updated by admin for account ${account.email}`,
          metadata: {
            account_email: account.email,
            account_name: `${account.first_name} ${account.last_name}`,
            updated_by: user.id,
            ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
            user_agent: req.headers.get('user-agent')
          },
          created_at: new Date().toISOString()
        });
    } catch (logError) {
      console.error('Error logging password update event:', logError);
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
      data: {
        account: {
          id: account.id,
          email: account.email,
          first_name: account.first_name,
          last_name: account.last_name
        }
      }
    });

  } catch (error: unknown) {
    console.error('Update password API error:', error);
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred while updating password',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
