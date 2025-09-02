import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { password } = await req.json();
    
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
      .select(`
        *,
        accounts!employees_account_id_fkey (
          id,
          auth_user_id,
          email,
          first_name,
          last_name,
          role,
          is_active
        )
      `)
      .eq('id', id)
      .single();

    if (employeeError || !employee) {
      return NextResponse.json({
        success: false,
        error: 'Employee not found',
      }, { status: 404 });
    }

    // Check if employee has an account
    if (!employee.account_id || !employee.accounts) {
      return NextResponse.json({
        success: false,
        error: 'Employee does not have an account. Please send an invitation first.',
      }, { status: 400 });
    }

    // Check if employee has an auth user
    if (!employee.accounts.auth_user_id) {
      return NextResponse.json({
        success: false,
        error: 'Employee account is not linked to an auth user.',
      }, { status: 400 });
    }

    // Update the password using Supabase admin
    const { error: updateError } = await supabaseServer().auth.admin.updateUserById(
      employee.accounts.auth_user_id,
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

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
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
