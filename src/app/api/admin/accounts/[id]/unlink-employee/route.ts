import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: accountId } = await params;

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

    // Get account data
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

    // Get employee linked to this account
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .eq('account_id', accountId)
      .single();

    if (employeeError || !employee) {
      return NextResponse.json({
        success: false,
        error: 'No employee linked to this account'
      }, { status: 404 });
    }

    // Update employee to remove account_id
    const { error: updateError } = await supabase
      .from('employees')
      .update({ 
        account_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', employee.id);

    if (updateError) {
      console.error('Error unlinking account from employee:', updateError);
      return NextResponse.json({
        success: false,
        error: 'Failed to unlink account from employee'
      }, { status: 500 });
    }

    // Log the account unlinking event if the account_events table exists
    try {
      await supabase
        .from('account_events')
        .insert({
          account_id: accountId,
          event_type: 'ACCOUNT_UNLINKED_FROM_EMPLOYEE',
          event_status: 'SUCCESS',
          description: `Account unlinked from employee ${employee.first_name} ${employee.last_name}`,
          metadata: {
            employee_id: employee.id,
            employee_name: `${employee.first_name} ${employee.last_name}`,
            employee_email: employee.email,
            unlinked_by: user.id,
            unlinked_at: new Date().toISOString()
          },
          created_at: new Date().toISOString()
        });
    } catch (eventError) {
      // Log the event error but don't fail the main operation
      console.warn('Failed to log account unlinking event:', eventError);
    }

    return NextResponse.json({
      success: true,
      message: 'Account unlinked successfully',
      data: {
        employee: {
          id: employee.id,
          first_name: employee.first_name,
          last_name: employee.last_name,
          email: employee.email,
          account_id: null
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
    console.error('Unlink account API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
