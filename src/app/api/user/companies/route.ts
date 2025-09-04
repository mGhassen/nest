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
    
    // Get user's account with superuser status
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id, is_superuser')
      .eq('auth_user_id', user.id)
      .single();
    
    if (accountError || !account) {
      return NextResponse.json(
        { success: false, error: 'Account not found' },
        { status: 404 }
      );
    }
    
    let companies;
    let error;
    
    if (account.is_superuser) {
      // For superusers, get ALL companies with their assigned role or default to ADMIN
      const { data: allCompanies, error: allCompaniesError } = await supabase
        .from('companies')
        .select(`
          id,
          name,
          company_branding!inner(icon_name)
        `)
        .order('name');
      
      if (allCompaniesError) {
        error = allCompaniesError;
      } else {
        // Get user's actual admin status for companies they're assigned to
        const { data: userRoles, error: rolesError } = await supabase
          .from('account_company_roles')
          .select('company_id, is_admin')
          .eq('account_id', account.id);
        
        if (rolesError) {
          error = rolesError;
        } else {
          // Create a map of company_id to is_admin
          const adminMap = new Map();
          if (userRoles) {
            userRoles.forEach(role => {
              adminMap.set(role.company_id, role.is_admin);
            });
          }
          
          // Map all companies with their admin status and employee access
          companies = await Promise.all(allCompanies.map(async (company) => {
            const isAdmin = adminMap.get(company.id) ?? true; // Default to true for superusers
            
            // Check if user has employee access in this company
            let hasEmployeeAccess = false;
            if (isAdmin) {
              // For superusers, they have employee access to all companies
              hasEmployeeAccess = true;
            } else {
              // For regular users, check if they have an active employee record
              const { data: employeeRecord } = await supabase
                .from('employees')
                .select('id, status')
                .eq('account_id', account.id)
                .eq('company_id', company.id)
                .eq('status', 'ACTIVE')
                .single();
              
              hasEmployeeAccess = !!employeeRecord;
            }
            
            return {
              company_id: company.id,
              company_name: company.name,
              is_admin: isAdmin,
              hasEmployeeAccess,
              icon_name: company.company_branding?.[0]?.icon_name
            };
          }));
        }
      }
    } else {
      // For regular users, use the existing function and add employee access info
      const result = await supabase
        .rpc('get_account_companies', { p_account_id: account.id });
      
      if (result.error) {
        error = result.error;
      } else {
        // Add employee access information for each company
        companies = await Promise.all(result.data.map(async (company: any) => {
          // Check if user has employee access in this company
          const { data: employeeRecord } = await supabase
            .from('employees')
            .select('id, status')
            .eq('account_id', account.id)
            .eq('company_id', company.company_id)
            .eq('status', 'ACTIVE')
            .single();
          
          return {
            ...company,
            hasEmployeeAccess: !!employeeRecord
          };
        }));
      }
    }
    
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
