import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params to access the id
    const { id } = await params;
    
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

    // Fetch the specific employee with related data
    const { data: employee, error: employeeError } = await supabaseServer()
      .from('employees')
      .select(`
        *,
        accounts!employees_account_id_fkey (
          id,
          email,
          first_name,
          last_name,
          role,
          is_active,
          profile_image_url
        ),
        companies!employees_company_id_fkey (
          id,
          name
        ),
        locations!employees_location_id_fkey (
          id,
          name,
          address,
          city,
          state,
          country
        ),
        cost_centers!employees_cost_center_id_fkey (
          id,
          code,
          name
        ),
        work_schedules!employees_work_schedule_id_fkey (
          id,
          name,
          weekly_hours
        )
      `)
      .eq('id', id)
      .single();

    if (employeeError) {
      console.error('Error fetching employee:', employeeError);
      return NextResponse.json({
        success: false,
        error: 'Employee not found',
        details: employeeError.message,
      }, { status: 404 });
    }

    // Fetch manager data separately if manager_id exists
    let manager = null;
    if (employee.manager_id) {
      const { data: managerData, error: managerError } = await supabaseServer()
        .from('employees')
        .select('id, first_name, last_name, email')
        .eq('id', employee.manager_id)
        .single();
      
      if (!managerError && managerData) {
        manager = managerData;
      }
    }

    // Transform the data to match the expected format
    const transformedEmployee = {
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
      // Include related data
      account: employee.accounts ? {
        id: employee.accounts.id,
        email: employee.accounts.email,
        first_name: employee.accounts.first_name,
        last_name: employee.accounts.last_name,
        role: employee.accounts.role,
        is_active: employee.accounts.is_active,
        profile_image_url: employee.accounts.profile_image_url
      } : null,
      company: employee.companies ? {
        id: employee.companies.id,
        name: employee.companies.name
      } : null,
      location: employee.locations ? {
        id: employee.locations.id,
        name: employee.locations.name,
        address: employee.locations.address,
        city: employee.locations.city,
        state: employee.locations.state,
        country: employee.locations.country
      } : null,
      cost_center: employee.cost_centers ? {
        id: employee.cost_centers.id,
        code: employee.cost_centers.code,
        name: employee.cost_centers.name
      } : null,
      work_schedule: employee.work_schedules ? {
        id: employee.work_schedules.id,
        name: employee.work_schedules.name,
        weekly_hours: employee.work_schedules.weekly_hours
      } : null,
      manager: manager ? {
        id: manager.id,
        first_name: manager.first_name,
        last_name: manager.last_name,
        email: manager.email
      } : null
    };

    return NextResponse.json({
      success: true,
      employee: transformedEmployee
    });

  } catch (error: unknown) {
    console.error('Employee API error:', error);
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred while fetching employee',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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

    const body = await req.json();
    
    // Update employee
    const { data: updatedEmployee, error: updateError } = await supabaseServer()
      .from('employees')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating employee:', updateError);
      return NextResponse.json({
        success: false,
        error: 'Failed to update employee',
        details: updateError.message,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      employee: updatedEmployee
    });

  } catch (error: unknown) {
    console.error('Update employee API error:', error);
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred while updating employee',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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

    // Delete employee
    const { error: deleteError } = await supabaseServer()
      .from('employees')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting employee:', deleteError);
      return NextResponse.json({
        success: false,
        error: 'Failed to delete employee',
        details: deleteError.message,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Employee deleted successfully'
    });

  } catch (error: unknown) {
    console.error('Delete employee API error:', error);
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred while deleting employee',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
