import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { isCurrentUserAdmin, getEmployeeRoleInCompany } from '@/lib/auth';

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
    const { data: userProfile, error: userProfileError } = await supabaseServer()
      .from('accounts')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (userProfileError || !userProfile) {
      return NextResponse.json({
        success: false,
        error: 'User profile not found',
      }, { status: 404 });
    }

    // Check if user is admin in their current company
    const isAdmin = await isCurrentUserAdmin(userProfile.id);
    if (!isAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Access denied. Admin privileges required.',
      }, { status: 403 });
    }

    // Get user's current company ID first (SECURITY: Check company access)
    const { data: currentCompany, error: currentCompanyError } = await supabaseServer()
      .rpc('get_current_company_info', { p_account_id: userProfile.id });
    
    if (currentCompanyError || !currentCompany || currentCompany.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No current company found. Please select a company first.',
      }, { status: 400 });
    }
    
    const currentCompanyId = currentCompany[0].company_id;

    // Fetch the specific employee with related data (SECURITY: Only from current company)
    const { data: employee, error: employeeError } = await supabaseServer()
      .from('employees')
      .select(`
        *,
        accounts!employees_account_id_fkey (
          id,
          email,
          first_name,
          last_name,
          is_active,
          profile_image_url,
          last_login,
          created_at
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
      .eq('company_id', currentCompanyId)  // SECURITY: Only allow access to employees in current company
      .single();

    if (employeeError) {
      console.error('Error fetching employee:', employeeError);
      return NextResponse.json({
        success: false,
        error: 'Employee not found',
        details: employeeError.message,
      }, { status: 404 });
    }

    // Create authenticated supabase client for administrative data queries
    const supabase = supabaseServer();
    
    // Fetch administrative data from normalized tables
    const [
      { data: profile, error: profileError },
      { data: addresses, error: addressesError },
      { data: contacts, error: contactsError },
      { data: documents, error: documentsError },
      { data: financialInfo, error: financialError },
      { data: medicalInfo, error: medicalError },
      { data: employmentDetails, error: employmentError },
      { data: documentStatus, error: documentStatusError },
      { data: administrativeNotes, error: notesError }
    ] = await Promise.all([
      // Employee profile
      supabase
        .from('employee_profiles')
        .select('*')
        .eq('employee_id', id)
        .single(),
      
      // Employee addresses
      supabase
        .from('employee_addresses')
        .select('*')
        .eq('employee_id', id)
        .order('is_primary', { ascending: false }),
      
      // Employee contacts
      supabase
        .from('employee_contacts')
        .select('*')
        .eq('employee_id', id)
        .order('is_primary', { ascending: false }),
      
      // Employee documents
      supabase
        .from('employee_documents')
        .select('*')
        .eq('employee_id', id)
        .order('document_type'),
      
      // Employee financial info
      supabase
        .from('employee_financial_info')
        .select('*')
        .eq('employee_id', id)
        .order('is_primary', { ascending: false }),
      
      // Employee medical info
      supabase
        .from('employee_medical_info')
        .select('*')
        .eq('employee_id', id)
        .single(),
      
      // Employee employment details
      supabase
        .from('employee_employment_details')
        .select('*')
        .eq('employee_id', id)
        .single(),
      
      // Employee document status
      supabase
        .from('employee_document_status')
        .select('*')
        .eq('employee_id', id)
        .order('status_type'),
      
      // Employee administrative notes
      supabase
        .from('employee_administrative_notes')
        .select('*')
        .eq('employee_id', id)
        .order('created_at', { ascending: false })
    ]);

    // Log any errors from administrative data fetching (only in development)
    if (process.env.NODE_ENV === 'development') {
      if (profileError) console.log('Profile error:', profileError);
      if (addressesError) console.log('Addresses error:', addressesError);
      if (contactsError) console.log('Contacts error:', contactsError);
      if (documentsError) console.log('Documents error:', documentsError);
      if (financialError) console.log('Financial error:', financialError);
      if (medicalError) console.log('Medical error:', medicalError);
      if (employmentError) console.log('Employment error:', employmentError);
      if (documentStatusError) console.log('Document status error:', documentStatusError);
      if (notesError) console.log('Notes error:', notesError);
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
        role: await getEmployeeRoleInCompany(employee.accounts.id, employee.company_id) || 'EMPLOYEE',
        is_active: employee.accounts.is_active,
        profile_image_url: employee.accounts.profile_image_url,
        last_login: employee.accounts.last_login,
        created_at: employee.accounts.created_at
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
      } : null,
      // Include normalized administrative data
      profile: profile || null,
      addresses: addresses || [],
      contacts: contacts || [],
      documents: documents || [],
      financial_info: financialInfo || [],
      medical_info: medicalInfo || null,
      employment_details: employmentDetails || null,
      document_status: documentStatus || [],
      administrative_notes: administrativeNotes || []
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
    const { data: userProfile, error: userProfileError } = await supabaseServer()
      .from('accounts')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (userProfileError || !userProfile) {
      return NextResponse.json({
        success: false,
        error: 'User profile not found',
      }, { status: 404 });
    }

    // Check if user is admin in their current company
    const isAdmin = await isCurrentUserAdmin(userProfile.id);
    if (!isAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Access denied. Admin privileges required.',
      }, { status: 403 });
    }

    // Get user's current company ID (SECURITY: Ensure employee is in current company)
    const { data: currentCompany, error: currentCompanyError } = await supabaseServer()
      .rpc('get_current_company_info', { p_account_id: userProfile.id });
    
    if (currentCompanyError || !currentCompany || currentCompany.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No current company found. Please select a company first.',
      }, { status: 400 });
    }
    
    const currentCompanyId = currentCompany[0].company_id;

    const body = await req.json();
    
    // Update employee (SECURITY: Only allow updates to employees in current company)
    const { data: updatedEmployee, error: updateError } = await supabaseServer()
      .from('employees')
      .update(body)
      .eq('id', id)
      .eq('company_id', currentCompanyId)  // SECURITY: Only update employees in current company
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
    const { data: userProfile, error: userProfileError } = await supabaseServer()
      .from('accounts')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (userProfileError || !userProfile) {
      return NextResponse.json({
        success: false,
        error: 'User profile not found',
      }, { status: 404 });
    }

    // Check if user is admin in their current company
    const isAdmin = await isCurrentUserAdmin(userProfile.id);
    if (!isAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Access denied. Admin privileges required.',
      }, { status: 403 });
    }

    // Get user's current company ID (SECURITY: Ensure employee is in current company)
    const { data: currentCompany, error: currentCompanyError } = await supabaseServer()
      .rpc('get_current_company_info', { p_account_id: userProfile.id });
    
    if (currentCompanyError || !currentCompany || currentCompany.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No current company found. Please select a company first.',
      }, { status: 400 });
    }
    
    const currentCompanyId = currentCompany[0].company_id;

    // Delete employee (SECURITY: Only allow deletion of employees in current company)
    const { error: deleteError } = await supabaseServer()
      .from('employees')
      .delete()
      .eq('id', id)
      .eq('company_id', currentCompanyId);  // SECURITY: Only delete employees in current company

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
