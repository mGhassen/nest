import { NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from 'next/headers'
import { getUserWithRole, can } from "@/lib/rbac"
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

    // Get user's company membership
    const { data: membership } = await supabase
      .from('memberships')
      .select('company_id')
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      // Return empty stats for users without company
      return NextResponse.json({
        totalEmployees: 0,
        pendingTimesheets: 0,
        leaveRequests: 0,
        payrollStatus: 'Not Setup'
      })
    }

    const companyId = membership.company_id

    // Get total employees
    const { count: totalEmployees } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'ACTIVE')

    // Get pending timesheets (filter by employee's company)
    const { data: pendingTimesheetsData } = await supabase
      .from('timesheets')
      .select(`
        id,
        employee:employees!inner(company_id)
      `)
      .eq('status', 'SUBMITTED')
      .eq('employee.company_id', companyId)

    const pendingTimesheets = pendingTimesheetsData?.length || 0

    // Get pending leave requests (filter by employee's company)
    const { data: leaveRequestsData } = await supabase
      .from('leave_requests')
      .select(`
        id,
        employee:employees!inner(company_id)
      `)
      .eq('status', 'SUBMITTED')
      .eq('employee.company_id', companyId)

    const leaveRequests = leaveRequestsData?.length || 0

    // Get latest payroll status
    const { data: latestPayroll } = await supabase
      .from('payroll_cycles')
      .select('status, month, year')
      .eq('company_id', companyId)
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .limit(1)
      .single()

    const stats = {
      totalEmployees: totalEmployees || 0,
      pendingTimesheets: pendingTimesheets || 0,
      leaveRequests: leaveRequests || 0,
      payrollStatus: latestPayroll ? `${latestPayroll.status} (${latestPayroll.month}/${latestPayroll.year})` : 'Not Setup'
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    )
  }
}
