import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const supabase = supabaseServer();
    
    // Get user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Get user's account
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();
    
    if (accountError || !account) {
      return NextResponse.json(
        { success: false, error: 'Account not found' },
        { status: 404 }
      );
    }
    
    // Get current company using simplified function
    const { data: currentCompany, error } = await supabase
      .rpc('get_current_company_info', { p_account_id: account.id });
    
    if (error) {
      console.error('Error fetching current company:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch current company' },
        { status: 500 }
      );
    }
    
    if (!currentCompany || currentCompany.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No current company found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      currentCompany: currentCompany[0]
    });
  } catch (error) {
    console.error('Current company API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { company_id } = body;
    
    if (!company_id) {
      return NextResponse.json(
        { success: false, error: 'Company ID is required' },
        { status: 400 }
      );
    }
    
    const supabase = supabaseServer();
    
    // Get user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Get user's account with superuser status
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id, is_superuser')
      .eq('auth_user_id', user.id)
      .single();
    
    if (accountError || !account) {
      return NextResponse.json(
        { success: false, error: 'Account not found' },
        { status: 404 }
      );
    }
    
    // Check if user has access to this company
    let hasAccess = null;
    let accessError = null;
    
    if (account.is_superuser) {
      // Superusers can access any company - check if company exists
      const { data: companyExists, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('id', company_id)
        .single();
      
      if (companyError || !companyExists) {
        accessError = companyError;
        hasAccess = null;
      } else {
        hasAccess = { is_admin: true }; // Superusers get admin access to any company
      }
    } else {
      // Regular users need to have access to the company
      const result = await supabase
        .from('account_company_roles')
        .select('is_admin')
        .eq('account_id', account.id)
        .eq('company_id', company_id)
        .single();
      
      hasAccess = result.data;
      accessError = result.error;
    }
    
    console.log('Debug - Company switch access check:', { hasAccess, accessError, accountId: account.id, companyId: company_id, isSuperuser: account.is_superuser });
    
    if (accessError || !hasAccess) {
      console.error('Access denied - user does not have access to company:', accessError);
      return NextResponse.json(
        { success: false, error: 'Access denied to this company' },
        { status: 403 }
      );
    }
    
    // Switch company using simplified function
    const { data: success, error } = await supabase
      .rpc('set_current_company', {
        p_account_id: account.id,
        p_company_id: company_id
      });
    
    console.log('Debug - Company switch result:', { success, error });
    
    if (error) {
      console.error('Error switching company:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to switch company' },
        { status: 500 }
      );
    }
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Access denied to this company' },
        { status: 403 }
      );
    }
    
    // Get the new current company info
    const { data: currentCompany, error: fetchError } = await supabase
      .rpc('get_current_company_info', { p_account_id: account.id });
    
    if (fetchError || !currentCompany || currentCompany.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch new company info' },
        { status: 500 }
      );
    }
    
    // Check if user has employee access in the new company
    let hasEmployeeAccess = false;
    if (currentCompany[0]) {
      const { data: employeeRecord, error: employeeError } = await supabase
        .from('employees')
        .select('id, status')
        .eq('account_id', account.id)
        .eq('company_id', currentCompany[0].company_id)
        .eq('status', 'ACTIVE')
        .single();
      
      hasEmployeeAccess = !employeeError && !!employeeRecord;
      console.log('Company switch - employee access check:', { 
        hasEmployeeAccess, 
        employeeError: employeeError?.message,
        employeeRecord: !!employeeRecord 
      });
    }
    
    return NextResponse.json({
      success: true,
      currentCompany: {
        ...currentCompany[0],
        hasEmployeeAccess
      },
      message: 'Company switched successfully'
    });
  } catch (error) {
    console.error('Switch company API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
