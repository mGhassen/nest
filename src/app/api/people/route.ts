import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function GET(req: NextRequest) {
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

    // Check if user is admin
    if (userProfile.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        error: 'Access denied. Admin privileges required.',
      }, { status: 403 });
    }

    // Fetch all employees
    const { data: employees, error: employeesError } = await supabaseServer()
      .from('employees')
      .select(`
        *,
        accounts!employees_account_id_fkey (
          id,
          email,
          first_name,
          last_name,
          role,
          is_active
        )
      `)
      .order('created_at', { ascending: false });

    if (employeesError) {
      console.error('Error fetching employees:', employeesError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch employees',
        details: employeesError.message,
      }, { status: 500 });
    }

    // Transform the data to match the expected format
    const transformedEmployees = employees.map(employee => ({
      id: employee.id,
      email: employee.email,
      first_name: employee.first_name,
      last_name: employee.last_name,
      position_title: employee.position_title,
      employment_type: employee.employment_type,
      status: employee.status || 'ACTIVE',
      hire_date: employee.hire_date,
      base_salary: employee.base_salary,
      salary_period: employee.salary_period,
      company_id: employee.company_id,
      location_id: employee.location_id,
      manager_id: employee.manager_id,
      cost_center_id: employee.cost_center_id,
      work_schedule_id: employee.work_schedule_id,
      account_id: employee.account_id,
      created_at: employee.created_at,
      updated_at: employee.updated_at,
      // Include account information if available
      account: employee.accounts ? {
        id: employee.accounts.id,
        email: employee.accounts.email,
        first_name: employee.accounts.first_name,
        last_name: employee.accounts.last_name,
        role: employee.accounts.role,
        is_active: employee.accounts.is_active
      } : null
    }));

    return NextResponse.json({
      success: true,
      people: transformedEmployees,
      count: transformedEmployees.length
    });

  } catch (error: unknown) {
    console.error('Employees API error:', error);
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred while fetching employees',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
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

    // Get user profile to check if they're admin
    const { data: userProfile, error: profileError } = await supabaseServer()
      .from('accounts')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    console.log('User profile lookup result:', { userProfile, profileError });

    if (profileError || !userProfile) {
      console.log('Profile error or not found:', profileError);
      return NextResponse.json({
        success: false,
        error: 'User profile not found',
      }, { status: 404 });
    }

    // Check if user is admin
    if (userProfile.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        error: 'Access denied. Admin privileges required.',
      }, { status: 403 });
    }

    // Get the user's employee record to find their company_id
    const { data: userEmployee, error: employeeError } = await supabaseServer()
      .from('employees')
      .select('company_id')
      .eq('account_id', userProfile.id)
      .single();

    console.log('User employee lookup result:', { userEmployee, employeeError });

    let companyId;
    
    if (employeeError || !userEmployee) {
      console.log('Employee record not found for user, trying to get company from first available company:', employeeError);
      
      // Fallback: Get the first company for admin users
      const { data: firstCompany, error: companyError } = await supabaseServer()
        .from('companies')
        .select('id')
        .limit(1)
        .single();
      
      if (companyError || !firstCompany) {
        console.log('No company found:', companyError);
        return NextResponse.json({
          success: false,
          error: 'No company found. Please contact administrator.',
          details: companyError?.message || 'No company available'
        }, { status: 404 });
      }
      
      companyId = firstCompany.id;
      console.log('Using fallback company ID:', companyId);
    } else {
      companyId = userEmployee.company_id;
      console.log('Using user company ID:', companyId);
    }

    const body = await req.json();
    console.log('Received employee creation request:', JSON.stringify(body, null, 2));
    
    // Validate required fields (excluding company_id since we'll use user's company)
    const requiredFields = ['first_name', 'last_name', 'email', 'position_title', 'employment_type', 'hire_date', 'base_salary', 'salary_period'];
    for (const field of requiredFields) {
      if (!body[field]) {
        console.log(`Missing required field: ${field}, value:`, body[field]);
        return NextResponse.json({
          success: false,
          error: `Missing required field: ${field}`,
        }, { status: 400 });
      }
    }

    // Validate that we have a company ID
    if (!companyId) {
      console.log('No company ID found for user');
      return NextResponse.json({
        success: false,
        error: 'User is not associated with a company',
      }, { status: 400 });
    }

    // Create new employee
    const { data: newEmployee, error: createError } = await supabaseServer()
      .from('employees')
      .insert([{
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        position_title: body.position_title,
        employment_type: body.employment_type,
        hire_date: body.hire_date,
        base_salary: body.base_salary,
        salary_period: body.salary_period,
        company_id: companyId, // Use the user's company ID
        location_id: body.location_id || null,
        manager_id: body.manager_id || null,
        cost_center_id: body.cost_center_id || null,
        work_schedule_id: body.work_schedule_id || null,
        account_id: body.account_id || null,
        status: body.status || 'ACTIVE'
      }])
      .select()
      .single();

    if (createError) {
      console.error('Error creating employee:', createError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create employee',
        details: createError.message,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      employee: newEmployee
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('Create employee API error:', error);
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred while creating employee',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
