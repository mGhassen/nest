import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
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
      .select('*')
      .eq('auth_user_id', user.id)
      .single();
    
    if (accountError || !account) {
      return NextResponse.json(
        { success: false, error: 'Account not found' },
        { status: 404 }
      );
    }
    
    // Get user's companies
    const { data: userCompanies, error: companiesError } = await supabase
      .rpc('get_account_companies', { p_account_id: account.id });
    
    // Get current company info
    const { data: currentCompany, error: currentCompanyError } = await supabase
      .rpc('get_current_company_info', { p_account_id: account.id });
    
    // Get account_company_roles directly
    const { data: accountRoles, error: rolesError } = await supabase
      .from('account_company_roles')
      .select('*')
      .eq('account_id', account.id);
    
    return NextResponse.json({
      success: true,
      debug: {
        user: {
          id: user.id,
          email: user.email
        },
        account: {
          id: account.id,
          email: account.email,
          current_company_id: account.current_company_id,
          has_role_column: 'role' in account
        },
        userCompanies: userCompanies || [],
        currentCompany: currentCompany || [],
        accountRoles: accountRoles || [],
        errors: {
          companiesError: companiesError?.message,
          currentCompanyError: currentCompanyError?.message,
          rolesError: rolesError?.message
        }
      }
    });
  } catch (error) {
    console.error('Debug auth API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
