import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { role = 'EMPLOYEE' } = await req.json();
    
    // Get the authorization header
    const authHeader = req.headers.get('authorization');
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

    // Get the employee record
    const { data: employee, error: employeeError } = await supabaseServer()
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();

    if (employeeError || !employee) {
      return NextResponse.json({
        success: false,
        error: 'Employee not found',
      }, { status: 404 });
    }

    // Check if employee already has an account
    if (employee.account_id) {
      return NextResponse.json({
        success: false,
        error: 'Employee already has an account',
      }, { status: 400 });
    }

    // Check if an account already exists for this email
    const { data: existingAccount, error: accountCheckError } = await supabaseServer()
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
        error: 'An account with this email already exists',
      }, { status: 400 });
    }

    // Create auth user using Supabase admin invite
    const { data: authData, error: inviteError } = await supabaseServer().auth.admin.inviteUserByEmail(
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
    const { data: newAccount, error: accountError } = await supabaseServer()
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
      await supabaseServer().auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({
        success: false,
        error: 'Failed to create account',
        details: accountError.message,
      }, { status: 500 });
    }

    // Link the account to the employee
    const { error: linkError } = await supabaseServer()
      .from('employees')
      .update({ account_id: newAccount.id })
      .eq('id', employee.id);

    if (linkError) {
      console.error('Error linking account to employee:', linkError);
      // Clean up the account and auth user if linking fails
      await supabaseServer().from('accounts').delete().eq('id', newAccount.id);
      await supabaseServer().auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({
        success: false,
        error: 'Failed to link account to employee',
        details: linkError.message,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation sent successfully',
      account: newAccount,
      authUser: authData.user
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
