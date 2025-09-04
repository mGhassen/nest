import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { isCurrentUserSuperuser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: companyId } = await params;

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

    // Get user profile
    const { data: userProfile, error: userProfileError } = await supabaseServer()
      .from('accounts')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (userProfileError || !userProfile) {
      return NextResponse.json({
        success: false,
        error: 'User profile not found',
      }, { status: 404 });
    }

    // Check if user has access to this company
    const { data: companyAccess, error: accessError } = await supabaseServer()
      .from('account_company_roles')
      .select('role')
      .eq('account_id', userProfile.id)
      .eq('company_id', companyId)
      .single();

    if (accessError || !companyAccess) {
      return NextResponse.json({
        success: false,
        error: 'Access denied. You do not have access to this company.',
      }, { status: 403 });
    }

    // Get company basic info
    const { data: company, error: companyError } = await supabaseServer()
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      return NextResponse.json({
        success: false,
        error: 'Company not found',
      }, { status: 404 });
    }

    // Get company profile
    const { data: profile, error: profileError } = await supabaseServer()
      .from('company_profiles')
      .select('*')
      .eq('company_id', companyId)
      .single();

    // Get company address
    const { data: address, error: addressError } = await supabaseServer()
      .from('company_addresses')
      .select('*')
      .eq('company_id', companyId)
      .single();

    // Get company contact
    const { data: contact, error: contactError } = await supabaseServer()
      .from('company_contacts')
      .select('*')
      .eq('company_id', companyId)
      .single();

    // Get company branding
    const { data: branding, error: brandingError } = await supabaseServer()
      .from('company_branding')
      .select('*')
      .eq('company_id', companyId)
      .single();

    // Get company social
    const { data: social, error: socialError } = await supabaseServer()
      .from('company_social')
      .select('*')
      .eq('company_id', companyId)
      .single();

    // Combine all data
    const companyData = {
      ...company,
      profile: profile || {},
      address: address || {},
      contact: contact || {},
      branding: branding || {},
      social: social || {},
      userRole: companyAccess.role,
    };

    return NextResponse.json({
      success: true,
      company: companyData,
    });

  } catch (error: unknown) {
    console.error('Get company API error:', error);
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred while fetching company',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
