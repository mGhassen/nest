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

    // Check permissions
    if (!can(user.role, "read", "employee")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get user's company membership
    const { data: membership } = await supabase
      .from('company_memberships')
      .select('company_id')
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: "No company found" }, { status: 404 })
    }

    const companyId = membership.company_id

    // Get departments with employee counts
    const { data: departments } = await supabase
      .from('departments')
      .select(`
        id,
        name,
        employees!inner(
          id,
          is_active
        )
      `)
      .eq('company_id', companyId)

    // Get team performance data
    const { data: timesheets } = await supabase
      .from('timesheets')
      .select(`
        employee_id,
        total_hours,
        week_start,
        status
      `)
      .eq('company_id', companyId)
      .eq('status', 'APPROVED')
      .gte('week_start', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

    // Calculate department statistics
    const departmentStats = departments?.map(dept => {
      const activeEmployees = dept.employees?.filter(emp => emp.is_active).length || 0
      const deptTimesheets = timesheets?.filter(ts => 
        dept.employees?.some(emp => emp.id === ts.employee_id)
      ) || []
      
      const totalHours = deptTimesheets.reduce((sum, ts) => sum + (ts.total_hours || 0), 0)
      const avgHours = deptTimesheets.length > 0 ? totalHours / deptTimesheets.length : 0

      return {
        name: dept.name,
        employees: activeEmployees,
        productivity: Math.round(avgHours * 10) / 10,
        target: 40, // 40 hours per week target
        progress: Math.min((avgHours / 40) * 100, 100)
      }
    }) || []

    // Get recent team activity
    const { data: recentActivity } = await supabase
      .from('employees')
      .select(`
        id,
        first_name,
        last_name,
        position_title,
        updated_at
      `)
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(5)

    const teamData = {
      departments: departmentStats,
      recentActivity: recentActivity?.map(emp => ({
        id: emp.id,
        name: `${emp.first_name} ${emp.last_name}`,
        role: emp.position_title,
        lastActive: emp.updated_at
      })) || [],
      totalEmployees: departmentStats.reduce((sum, dept) => sum + dept.employees, 0),
      averageProductivity: departmentStats.length > 0 
        ? Math.round(departmentStats.reduce((sum, dept) => sum + dept.productivity, 0) / departmentStats.length * 10) / 10
        : 0
    }

    return NextResponse.json(teamData)
  } catch (error) {
    console.error("Error fetching team data:", error)
    return NextResponse.json(
      { error: "Failed to fetch team data" },
      { status: 500 }
    )
  }
}
