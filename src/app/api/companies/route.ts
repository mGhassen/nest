import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { isCurrentUserSuperuser } from '@/lib/auth';

export async function GET() {
  try {
    // Get all companies (for superuser linking functionality)
    const { data: companies, error } = await supabaseServer()
      .from('companies')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching companies:', error);
      return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 });
    }

    return NextResponse.json({ companies });

  } catch (error) {
    console.error('Error in GET /api/companies:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
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

    // Check if user is a superuser
    const isSuperuser = await isCurrentUserSuperuser(userProfile.id);
    if (!isSuperuser) {
      return NextResponse.json({
        success: false,
        error: 'Access denied. Superuser privileges required.',
      }, { status: 403 });
    }

    // Parse request body
    const body = await req.json();
    const {
      name, legal_name, description, industry, company_size, founded_year,
      website, email, phone, fax,
      address, address_line_2, city, state, country, postal_code, timezone,
      tax_id, registration_number, vat_number, business_type, legal_structure,
      currency, fiscal_year_start, fiscal_year_end,
      brand_color, secondary_color,
      linkedin_url, twitter_url, facebook_url, instagram_url
    } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Company name is required',
      }, { status: 400 });
    }

    if (!industry || typeof industry !== 'string' || industry.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Industry is required',
      }, { status: 400 });
    }

    if (!company_size || typeof company_size !== 'string' || company_size.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Company size is required',
      }, { status: 400 });
    }

    if (!country || typeof country !== 'string' || country.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Country is required',
      }, { status: 400 });
    }

    // Create the company
    const { data: newCompany, error: createError } = await supabaseServer()
      .from('companies')
      .insert({
        name: name.trim(),
        legal_name: legal_name?.trim() || null,
        description: description?.trim() || null,
        industry: industry.trim(),
        company_size: company_size.trim(),
        founded_year: founded_year || null,
        website: website?.trim() || null,
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        fax: fax?.trim() || null,
        address: address?.trim() || null,
        address_line_2: address_line_2?.trim() || null,
        city: city?.trim() || null,
        state: state?.trim() || null,
        country: country.trim(),
        postal_code: postal_code?.trim() || null,
        timezone: timezone?.trim() || null,
        tax_id: tax_id?.trim() || null,
        registration_number: registration_number?.trim() || null,
        vat_number: vat_number?.trim() || null,
        business_type: business_type?.trim() || null,
        legal_structure: legal_structure?.trim() || null,
        currency: currency?.trim() || 'USD',
        fiscal_year_start: fiscal_year_start || null,
        fiscal_year_end: fiscal_year_end || null,
        brand_color: brand_color?.trim() || null,
        secondary_color: secondary_color?.trim() || null,
        linkedin_url: linkedin_url?.trim() || null,
        twitter_url: twitter_url?.trim() || null,
        facebook_url: facebook_url?.trim() || null,
        instagram_url: instagram_url?.trim() || null,
        created_by: userProfile.id,
        updated_by: userProfile.id,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating company:', createError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create company',
        details: createError.message,
      }, { status: 500 });
    }

    // Add the superuser as admin of the new company
    const { error: roleError } = await supabaseServer()
      .from('account_company_roles')
      .insert({
        account_id: userProfile.id,
        company_id: newCompany.id,
        role: 'SUPERUSER',
      });

    if (roleError) {
      console.error('Error adding superuser role to new company:', roleError);
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      success: true,
      company: newCompany,
    });

  } catch (error: unknown) {
    console.error('Create company API error:', error);
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred while creating company',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}