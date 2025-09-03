import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { isCurrentUserSuperuser } from '@/lib/auth';

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
    const { name, description, address, city, state, country, postal_code, timezone } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Company name is required',
      }, { status: 400 });
    }

    // Create the company
    const { data: newCompany, error: createError } = await supabaseServer()
      .from('companies')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        address: address?.trim() || null,
        city: city?.trim() || null,
        state: state?.trim() || null,
        country: country?.trim() || null,
        postal_code: postal_code?.trim() || null,
        timezone: timezone?.trim() || null,
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