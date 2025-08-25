import { NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from 'next/headers'
import { getUserWithRole } from "@/lib/rbac"
import type { Database } from "@/types/database.types"

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserWithRole(session.user.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get company stats
    const { count: totalEmployees } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', user.company_id)

    // Get pending timesheets for company
    const { data: companyEmployees } = await supabase
      .from('employees')
      .select('id')
      .eq('company_id', user.company_id)

    let pendingTimesheets = 0
    if (companyEmployees && companyEmployees.length > 0) {
      const employeeIds = companyEmployees.map(emp => emp.id)
      const { count } = await supabase
        .from('timesheets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'SUBMITTED')
        .in('employee_id', employeeIds)
      pendingTimesheets = count || 0
    }

    // Get pending leave requests for company
    let pendingLeaveRequests = 0
    if (companyEmployees && companyEmployees.length > 0) {
      const employeeIds = companyEmployees.map(emp => emp.id)
      const { count } = await supabase
        .from('leave_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'SUBMITTED')
        .in('employee_id', employeeIds)
      pendingLeaveRequests = count || 0
    }

    const { count: activePayrollCycles } = await supabase
      .from('payroll_cycles')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', user.company_id)
      .eq('status', 'UPLOADED')

    // Get role-specific stats
    let roleSpecificStats = {}

    if (user.role === "EMPLOYEE") {
      // Employee can only see their own stats
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (employee) {
        const { count: myPendingTimesheets } = await supabase
          .from('timesheets')
          .select('*', { count: 'exact', head: true })
          .eq('employee_id', employee.id)
          .eq('status', 'SUBMITTED')

        const { count: myPendingLeaveRequests } = await supabase
          .from('leave_requests')
          .select('*', { count: 'exact', head: true })
          .eq('employee_id', employee.id)
          .eq('status', 'SUBMITTED')

        roleSpecificStats = {
          myPendingTimesheets: myPendingTimesheets || 0,
          myPendingLeaveRequests: myPendingLeaveRequests || 0,
        }
      }
    } else if (user.role === "MANAGER") {
      // Manager can see direct reports' stats
      const { data: directReports } = await supabase
        .from('employees')
        .select('id')
        .eq('manager_id', user.id)

      if (directReports && directReports.length > 0) {
        const directReportIds = directReports.map(emp => emp.id)

        const { count: directReportsPendingTimesheets } = await supabase
          .from('timesheets')
          .select('*', { count: 'exact', head: true })
          .in('employee_id', directReportIds)
          .eq('status', 'SUBMITTED')

        const { count: directReportsPendingLeaveRequests } = await supabase
          .from('leave_requests')
          .select('*', { count: 'exact', head: true })
          .in('employee_id', directReportIds)
          .eq('status', 'SUBMITTED')

        roleSpecificStats = {
          directReportsCount: directReports.length,
          directReportsPendingTimesheets: directReportsPendingTimesheets || 0,
          directReportsPendingLeaveRequests: directReportsPendingLeaveRequests || 0,
        }
      } else {
        roleSpecificStats = {
          directReportsCount: 0,
          directReportsPendingTimesheets: 0,
          directReportsPendingLeaveRequests: 0,
        }
      }
    }

    const stats = {
      totalEmployees: totalEmployees || 0,
      pendingTimesheets,
      pendingLeaveRequests,
      activePayrollCycles: activePayrollCycles || 0,
      ...roleSpecificStats,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
