import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseServer();
    
    // Get all companies
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching companies:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch companies' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      companies
    });
  } catch (error) {
    console.error('Companies API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, country_code, currency } = body;
    
    if (!name || !country_code || !currency) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const supabase = supabaseServer();
    
    const { data: company, error } = await supabase
      .from('companies')
      .insert({
        name,
        country_code,
        currency
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating company:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create company' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      company
    });
  } catch (error) {
    console.error('Create company API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
