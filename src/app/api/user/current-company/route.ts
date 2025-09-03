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
    
    // Check if user has access to this company first
    const { data: hasAccess, error: accessError } = await supabase
      .from('account_company_roles')
      .select('role')
      .eq('account_id', account.id)
      .eq('company_id', company_id)
      .single();
    
    console.log('Debug - Company switch access check:', { hasAccess, accessError, accountId: account.id, companyId: company_id });
    
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
    
    return NextResponse.json({
      success: true,
      currentCompany: currentCompany[0],
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
