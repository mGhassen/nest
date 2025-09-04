import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { isCurrentUserAdmin } from '@/lib/auth';

export async function GET(
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

    // Check if user is admin in their current company
    const isAdmin = await isCurrentUserAdmin(userProfile.id);
    if (!isAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Access denied. Admin privileges required.',
      }, { status: 403 });
    }

    // Get current company info
    const { data: currentCompany, error: companyError } = await supabaseServer()
      .rpc('get_current_company_info', { p_account_id: userProfile.id });

    if (companyError || !currentCompany || currentCompany.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Unable to determine current company',
      }, { status: 400 });
    }

    const currentCompanyId = currentCompany[0].company_id;

    // Fetch the specific account and verify it belongs to the current company
    const { data: account, error: accountError } = await supabaseServer()
      .from('accounts')
      .select(`
        *,
        account_company_roles!inner(
          company_id,
          is_admin,
          is_active,
          joined_at
        )
      `)
      .eq('id', id)
      .eq('account_company_roles.company_id', currentCompanyId)
      .single();

    if (accountError || !account) {
      return NextResponse.json({
        success: false,
        error: 'Account not found',
      }, { status: 404 });
    }

    // Fetch all company relationships for this account
    const { data: allCompanyRoles, error: companyRolesError } = await supabaseServer()
      .from('account_company_roles')
      .select(`
        company_id,
        is_admin,
        is_active,
        joined_at,
        companies!inner(
          id,
          name,
          status
        )
      `)
      .eq('account_id', id);

    if (companyRolesError) {
      console.error('Error fetching company roles:', companyRolesError);
    }

    // Fetch linked employee if exists (from current company)
    const { data: employee, error: employeeError } = await supabaseServer()
      .from('employees')
      .select('*')
      .eq('account_id', id)
      .eq('company_id', currentCompanyId)
      .single();

    if (employeeError && employeeError.code !== 'PGRST116') {
      console.error('Error fetching employee:', employeeError);
    }

    // Get current company role
    const currentCompanyRole = account.account_company_roles?.[0];

    // Combine account with comprehensive data
    const accountWithData = {
      ...account,
      current_company_role: currentCompanyRole,
      all_company_roles: allCompanyRoles || [],
      employee: employee ? {
        id: employee.id,
        first_name: employee.first_name,
        last_name: employee.last_name,
        position_title: employee.position_title,
        status: employee.status
      } : null
    };

    return NextResponse.json({
      success: true,
      data: accountWithData
    });

  } catch (error) {
    console.error('Error in GET /api/admin/accounts/[id]:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
