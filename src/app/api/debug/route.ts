import { NextResponse } from "next/server"
import { supabaseServer } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🔍 Debug endpoint called');
    
    const supabase = supabaseServer()
    
    // Test basic connection
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      return NextResponse.json({ 
        error: "Session error", 
        details: sessionError,
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

    // Test direct database connection
    console.log("🔍 Testing direct database connection...")
    const { data: directTest, error: directError } = await supabase
      .from('employees')
      .select('count')
      .limit(1)
    
    console.log("🔍 Direct test result:", { data: directTest, error: directError })

    // Test companies table
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .limit(5)

    // Test accounts table
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('*')
      .limit(5)

    // Test memberships table
    const { data: memberships, error: membershipsError } = await supabase
      .from('memberships')
      .select('*')
      .limit(5)

    // Test employees table
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('*')
      .limit(5)

    // Test environment variables
    const envCheck = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Missing',
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
      supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing'
    }

    // Test Supabase auth directly
    let authTest: { success: boolean; error: string | null; details: unknown } = { success: false, error: null, details: null };
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'admin@guepard.run',
        password: 'admin123'
      });
      
      if (authError) {
        authTest = { success: false, error: authError.message, details: authError };
      } else if (authData.session) {
        authTest = { success: true, error: null, details: 'Session created successfully' };
      } else {
        authTest = { success: false, error: 'No session created', details: null };
      }
    } catch (authTestError) {
      authTest = { success: false, error: 'Auth test failed', details: authTestError };
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      user: session ? {
        id: session.user.id,
        email: session.user.email
      } : null,
      environment: envCheck,
      authTest: authTest,
      companies: {
        data: companies,
        error: companiesError,
        count: companies?.length || 0
      },
      accounts: {
        data: accounts,
        error: accountsError,
        count: accounts?.length || 0
      },
      memberships: {
        data: memberships,
        error: membershipsError,
        count: memberships?.length || 0
      },
      employees: {
        data: employees,
        error: employeesError,
        count: employees?.length || 0
      }
    })
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json({ 
      error: "Debug error", 
      details: error,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
