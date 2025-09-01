import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase"


import { getUserWithRole, can } from "@/lib/rbac"
import type { Database } from "@/types/database.types"

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseServer()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserWithRole(session.user.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check permissions
    if (!can(user.role, "read", "audit")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get user's company membership
    const { data: membership } = await supabase
      .from('memberships')
      .select('company_id')
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: "No company found" }, { status: 404 })
    }

    const companyId = membership.company_id

    // Get employee growth data
    const { data: employees } = await supabase
      .from('employees')
      .select('created_at')
      .eq('company_id', companyId)
      .eq('is_active', true)

    // Calculate employee growth (simplified for demo)
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear

    const currentEmployees = employees?.filter(emp => {
      const created = new Date(emp.created_at || '')
      return created.getMonth() === currentMonth && created.getFullYear() === currentYear
    }).length || 0

    const previousEmployees = employees?.filter(emp => {
      const created = new Date(emp.created_at || '')
      return created.getMonth() === previousMonth && created.getFullYear() === previousYear
    }).length || 0

    const employeeGrowth = {
      current: currentEmployees,
      previous: previousEmployees,
      trend: currentEmployees > previousEmployees ? 'up' : 'down',
      percentage: previousEmployees > 0 ? Math.round(((currentEmployees - previousEmployees) / previousEmployees) * 100) : 0
    }

    // Get productivity data (simplified for demo)
    const { data: timesheets } = await supabase
      .from('timesheets')
      .select('total_hours, week_start')
      .eq('company_id', companyId)
      .eq('status', 'APPROVED')
      .gte('week_start', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

    const totalHours = timesheets?.reduce((sum, ts) => sum + (ts.total_hours || 0), 0) || 0
    const averageProductivity = {
      score: totalHours > 0 ? Math.round((totalHours / (timesheets?.length || 1)) * 10) / 10 : 0,
      trend: 'up',
      percentage: 85
    }

    // Get leave analytics
    const { data: leaveRequests } = await supabase
      .from('leave_requests')
      .select('status, start_date')
      .eq('company_id', companyId)
      .gte('start_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

    const approvedLeaves = leaveRequests?.filter(lr => lr.status === 'APPROVED').length || 0
    const totalLeaves = leaveRequests?.length || 0
    const leaveApprovalRate = totalLeaves > 0 ? Math.round((approvedLeaves / totalLeaves) * 100) : 0

    const analyticsData = {
      employeeGrowth,
      averageProductivity,
      leaveApprovalRate: {
        rate: leaveApprovalRate,
        trend: leaveApprovalRate > 80 ? 'up' : 'down',
        percentage: leaveApprovalRate
      },
      departmentDistribution: [
        { name: 'Engineering', count: 12, percentage: 40 },
        { name: 'Sales', count: 8, percentage: 27 },
        { name: 'Marketing', count: 5, percentage: 17 },
        { name: 'HR', count: 3, percentage: 10 },
        { name: 'Finance', count: 2, percentage: 6 }
      ],
      monthlyTrends: {
        employees: [10, 12, 15, 18, 22, 25, 28, 30, 32, 35, 38, 40],
        productivity: [7.2, 7.5, 7.8, 8.1, 8.3, 8.5, 8.7, 8.9, 9.1, 9.3, 9.5, 9.8],
        turnover: [2, 1, 3, 1, 2, 1, 2, 1, 1, 2, 1, 1]
      }
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
