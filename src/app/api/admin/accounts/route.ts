import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, createSupabaseAdminClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
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

    // Fetch all accounts
    const { data: accounts, error: accountsError } = await supabaseServer()
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (accountsError) {
      console.error('Error fetching accounts:', accountsError);
      return NextResponse.json({ 
        success: false,
        error: 'Failed to fetch accounts',
        details: accountsError.message 
      }, { status: 500 });
    }

    // Fetch all employees
    const { data: employees, error: employeesError } = await supabaseServer()
      .from('employees')
      .select('*');

    if (employeesError) {
      console.error('Error fetching employees:', employeesError);
    }

    // Manually link accounts to employees
    const accountsWithEmployees = accounts?.map(account => {
      const linkedEmployee = employees?.find(emp => emp.account_id === account.id);
      return {
        ...account,
        employee: linkedEmployee ? {
          id: linkedEmployee.id,
          first_name: linkedEmployee.first_name,
          last_name: linkedEmployee.last_name,
          position_title: linkedEmployee.position_title,
          status: linkedEmployee.status
        } : null
      };
    }) || [];

    return NextResponse.json({ 
      success: true,
      data: accountsWithEmployees
    });
  } catch (error) {
    console.error('Error in GET /api/admin/accounts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();
    const { email, password, first_name, last_name, role } = body;

    // Validate required fields
    if (!email || !password || !first_name || !last_name || !role) {
      return NextResponse.json({ 
        error: 'Missing required fields: email, password, first_name, last_name, role' 
      }, { status: 400 });
    }

    // Create the auth user first using admin client
    const adminSupabase = createSupabaseAdminClient();
    const { data: authUser, error: authCreateError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name,
        last_name,
        role: role.toUpperCase()
      }
    });

    if (authCreateError) {
      console.error('Error creating auth user:', authCreateError);
      return NextResponse.json({ 
        success: false,
        error: `Failed to create auth user: ${authCreateError.message}` 
      }, { status: 400 });
    }

    if (!authUser.user) {
      return NextResponse.json({ 
        success: false,
        error: 'Failed to create auth user' 
      }, { status: 500 });
    }

    // Create the account record
    const { data: newAccount, error: accountCreateError } = await supabaseServer()
      .from('accounts')
      .insert({
        auth_user_id: authUser.user.id,
        email,
        first_name,
        last_name,
        role: role.toUpperCase(),
        is_active: true,
        account_status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (accountCreateError) {
      console.error('Error creating account:', accountCreateError);
      
      // Clean up the auth user if account creation failed
      await adminSupabase.auth.admin.deleteUser(authUser.user.id);
      
      return NextResponse.json({ 
        success: false,
        error: `Failed to create account: ${accountCreateError.message}` 
      }, { status: 500 });
    }

    // Log the account creation event if the account_events table exists
    try {
      await supabaseServer()
        .from('account_events')
        .insert({
          account_id: newAccount.id,
          event_type: 'ACCOUNT_CREATED',
          event_status: 'SUCCESS',
          description: 'Account created by admin',
          metadata: {
            created_by: user.id,
            created_by_email: user.email,
            new_user_email: email,
            new_user_role: role.toUpperCase()
          }
        });
    } catch (logError) {
      // Don't fail the account creation if logging fails
      console.warn('Failed to log account creation event:', logError);
    }

    return NextResponse.json({ 
      success: true, 
      data: newAccount,
      message: 'Account created successfully' 
    });

  } catch (error) {
    console.error('Error in POST /api/admin/accounts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}