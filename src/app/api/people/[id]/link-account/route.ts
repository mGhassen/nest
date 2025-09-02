import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: employeeId } = await params;
    const { accountId } = await req.json();

    if (!accountId) {
      return NextResponse.json({
        success: false,
        error: 'Account ID is required'
      }, { status: 400 });
    }

    // Create Supabase client
    const supabase = supabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
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

    // Get employee data
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
        error: 'Employee already has a linked account'
      }, { status: 400 });
    }

    // Get the account to link
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

    // Check if account is already linked to another employee
    const { data: existingEmployee } = await supabase
      .from('employees')
      .select('id, first_name, last_name')
      .eq('account_id', accountId)
      .single();

    if (existingEmployee) {
      return NextResponse.json({
        success: false,
        error: `Account is already linked to employee ${existingEmployee.first_name} ${existingEmployee.last_name}`
      }, { status: 400 });
    }

    // Update employee with account_id
    const { error: updateError } = await supabase
      .from('employees')
      .update({ 
        account_id: accountId,
        updated_at: new Date().toISOString()
      })
      .eq('id', employeeId);

    if (updateError) {
      console.error('Error linking account to employee:', updateError);
      return NextResponse.json({
        success: false,
        error: 'Failed to link account to employee'
      }, { status: 500 });
    }

    // Log the account linking event if the account_events table exists
    try {
      await supabase
        .from('account_events')
        .insert({
          account_id: accountId,
          event_type: 'ACCOUNT_LINKED_TO_EMPLOYEE',
          event_data: {
            employee_id: employeeId,
            employee_name: `${employee.first_name} ${employee.last_name}`,
            employee_email: employee.email,
            linked_by: user.id,
            linked_at: new Date().toISOString()
          },
          created_at: new Date().toISOString()
        });
    } catch (eventError) {
      // Log the event error but don't fail the main operation
      console.warn('Failed to log account linking event:', eventError);
    }

    return NextResponse.json({
      success: true,
      message: 'Account linked successfully',
      data: {
        employee: {
          id: employee.id,
          first_name: employee.first_name,
          last_name: employee.last_name,
          email: employee.email,
          account_id: accountId
        },
        account: {
          id: account.id,
          email: account.email,
          first_name: account.first_name,
          last_name: account.last_name,
          role: account.role
        }
      }
    });

  } catch (error: unknown) {
    console.error('Link account API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
