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
    
    // Get user's companies using the simplified function
    const { data: companies, error } = await supabase
      .rpc('get_account_companies', { p_account_id: account.id });
    
    if (error) {
      console.error('Error fetching user companies:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch user companies' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      companies
    });
  } catch (error) {
    console.error('User companies API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
