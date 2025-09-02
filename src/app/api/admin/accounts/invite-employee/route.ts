import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { employeeId, role = 'EMPLOYEE' } = await req.json();
    
    if (!employeeId) {
      return NextResponse.json({
        success: false,
        error: 'Employee ID is required'
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

    // Get the employee record
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', employeeId)
      .single();

    if (employeeError || !employee) {
      return NextResponse.json({
        success: false,
        error: 'Employee not found'
      }, { status: 404 });
    }

    // Check if employee already has an account
    if (employee.account_id) {
      return NextResponse.json({
        success: false,
        error: 'Employee already has an account'
      }, { status: 400 });
    }

    // Check if an account already exists for this email
    const { data: existingAccount, error: accountCheckError } = await supabase
      .from('accounts')
      .select('id, auth_user_id')
      .eq('email', employee.email)
      .single();

    if (accountCheckError && accountCheckError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected
      console.error('Error checking existing account:', accountCheckError);
      return NextResponse.json({
        success: false,
        error: 'Failed to check existing account',
        details: accountCheckError.message,
      }, { status: 500 });
    }

    if (existingAccount) {
      return NextResponse.json({
        success: false,
        error: 'An account with this email already exists'
      }, { status: 400 });
    }

    // Create auth user using Supabase admin invite
    const { data: authData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
      employee.email,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/accept-invitation`,
        data: {
          first_name: employee.first_name,
          last_name: employee.last_name,
          employee_id: employee.id,
          role: role
        }
      }
    );

    if (inviteError || !authData.user) {
      console.error('Supabase inviteUserByEmail error:', inviteError);
      return NextResponse.json({
        success: false,
        error: 'Failed to send invitation email',
        details: inviteError?.message || 'Unknown error',
      }, { status: 500 });
    }

    // Create account record linked to the auth user
    const { data: newAccount, error: accountError } = await supabase
      .from('accounts')
      .insert([{
        auth_user_id: authData.user.id,
        email: employee.email,
        first_name: employee.first_name,
        last_name: employee.last_name,
        role: role,
        is_active: false, // Will be activated when they accept the invitation
      }])
      .select()
      .single();

    if (accountError) {
      console.error('Error creating account:', accountError);
      // Clean up the auth user if account creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({
        success: false,
        error: 'Failed to create account',
        details: accountError.message,
      }, { status: 500 });
    }

    // Link the account to the employee
    const { error: linkError } = await supabase
      .from('employees')
      .update({ account_id: newAccount.id })
      .eq('id', employee.id);

    if (linkError) {
      console.error('Error linking account to employee:', linkError);
      // Clean up the account and auth user if linking fails
      await supabase.from('accounts').delete().eq('id', newAccount.id);
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({
        success: false,
        error: 'Failed to link account to employee',
        details: linkError.message,
      }, { status: 500 });
    }

    // Log the account creation event
    try {
      await supabase
        .from('account_events')
        .insert({
          account_id: newAccount.id,
          event_type: 'ACCOUNT_CREATED',
          event_status: 'SUCCESS',
          description: `Account created and invitation sent for employee ${employee.first_name} ${employee.last_name}`,
          metadata: {
            employee_id: employee.id,
            employee_name: `${employee.first_name} ${employee.last_name}`,
            employee_email: employee.email,
            role: role,
            created_by: user.id,
            created_at: new Date().toISOString()
          },
          created_at: new Date().toISOString()
        });
    } catch (eventError) {
      // Log the event error but don't fail the main operation
      console.warn('Failed to log account creation event:', eventError);
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation sent successfully',
      data: {
        account: newAccount,
        authUser: authData.user,
        employee: {
          id: employee.id,
          first_name: employee.first_name,
          last_name: employee.last_name,
          email: employee.email
        }
      }
    });

  } catch (error: unknown) {
    console.error('Send invitation API error:', error);
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred while sending invitation',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
