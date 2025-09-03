import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    
    console.log('Session API called with token:', token ? 'present' : 'missing');
    
    if (!token) {
      console.log('No token provided in session API');
      return NextResponse.json({
        success: false,
        error: 'No token provided',
      }, { status: 401 });
    }

    // Get user from token
    console.log('Validating token with Supabase...');
    const { data: { user }, error: userError } = await supabaseServer().auth.getUser(token);
    
    if (userError) {
      console.log('Token validation error:', userError);
    }
    
    if (userError || !user) {
      console.log('Invalid or expired token');
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired token',
      }, { status: 401 });
    }

    console.log('Token validated, user ID:', user.id);

    // Get user profile
    const { data: userData, error: dbError } = await supabaseServer()
      .from('accounts')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (dbError) {
      console.log('Database error:', dbError);
    }

    if (dbError || !userData) {
      console.log('User profile not found for user ID:', user.id);
      return NextResponse.json({
        success: false,
        error: 'User profile not found',
        userId: user.id,
      }, { status: 404 });
    }

    console.log('User profile found, is_active:', userData.is_active);

    // Status checks
    if (!userData.is_active) {
      return NextResponse.json({
        success: false,
        error: 'Account is not active. Please contact support.',
        status: 'inactive',
      }, { status: 403 });
    }

    // Get user's companies
    const { data: userCompanies, error: companiesError } = await supabaseServer()
      .rpc('get_account_companies', { p_account_id: userData.id });

    if (companiesError) {
      console.log('Error fetching user companies:', companiesError);
    }

    // Get current company info
    const { data: currentCompany, error: currentCompanyError } = await supabaseServer()
      .rpc('get_current_company_info', { p_account_id: userData.id });

    if (currentCompanyError) {
      console.log('Error fetching current company:', currentCompanyError);
    }

    // Determine current role and company
    let currentCompanyData = currentCompany && currentCompany.length > 0 ? currentCompany[0] : null;
    let currentRole = 'EMPLOYEE'; // Default fallback
    let currentCompanyId = null;

    console.log('Debug - userCompanies:', userCompanies);
    console.log('Debug - currentCompany:', currentCompany);
    console.log('Debug - account current_company_id:', userData.current_company_id);

    // If no current company is set, get the first available company for the user
    if (!currentCompanyData && userCompanies && userCompanies.length > 0) {
      const firstCompany = userCompanies[0];
      currentCompanyData = {
        company_id: firstCompany.company_id,
        company_name: firstCompany.company_name,
        role: firstCompany.role
      };
      currentRole = firstCompany.role;
      currentCompanyId = firstCompany.company_id;
      
      console.log('Debug - Setting first company as current:', firstCompany);
      
      // Set the first company as current
      try {
        await supabaseServer()
          .from('accounts')
          .update({ current_company_id: firstCompany.company_id })
          .eq('id', userData.id);
        console.log('Debug - Successfully set current company');
      } catch (updateError) {
        console.log('Error setting current company:', updateError);
      }
    } else if (currentCompanyData) {
      // Use the current company data
      currentRole = currentCompanyData.role;
      currentCompanyId = currentCompanyData.company_id;
      console.log('Debug - Using existing current company:', currentCompanyData);
    } else {
      console.log('Debug - No companies found for user');
    }

    console.log('Debug - Final currentRole:', currentRole);
    console.log('Debug - Final currentCompanyId:', currentCompanyId);

    // Return user data with multi-company support
    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        email: user.email || '',
        isAdmin: currentRole === 'ADMIN' || currentRole === 'SUPERUSER',
        firstName: userData.first_name || user.email?.split('@')[0] || 'User',
        lastName: userData.last_name || '',
        status: userData.is_active ? 'active' : 'inactive',
        role: currentRole,
        companyId: currentCompanyId,
        // Multi-company data
        companies: userCompanies || [],
        currentCompany: currentCompanyData,
      },
    });
  } catch (error: unknown) {
    console.error('Session API error:', error);
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}