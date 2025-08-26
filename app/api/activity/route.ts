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
    if (!can(user.role, "read", "audit")) {
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

    // Get recent leave requests
    const { data: leaveRequests } = await supabase
      .from('leave_requests')
      .select(`
        id,
        start_date,
        end_date,
        status,
        reason,
        employee:employees!inner(
          id,
          first_name,
          last_name,
          position_title
        )
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(5)

    // Get recent timesheet submissions
    const { data: timesheets } = await supabase
      .from('timesheets')
      .select(`
        id,
        week_start,
        total_hours,
        status,
        employee:employees!inner(
          id,
          first_name,
          last_name,
          position_title
        )
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(5)

    // Get recent employee updates
    const { data: employeeUpdates } = await supabase
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

    // Combine and format activities
    const activities = []

    // Add leave requests
    leaveRequests?.forEach(lr => {
      activities.push({
        id: lr.id,
        type: 'leave_request',
        title: `${lr.employee.first_name} ${lr.employee.last_name} requested leave`,
        description: `${lr.reason || 'No reason provided'} (${lr.start_date} to ${lr.end_date})`,
        status: lr.status,
        timestamp: lr.created_at,
        user: {
          name: `${lr.employee.first_name} ${lr.employee.last_name}`,
          role: lr.employee.position_title
        }
      })
    })

    // Add timesheet submissions
    timesheets?.forEach(ts => {
      activities.push({
        id: ts.id,
        type: 'timesheet',
        title: `${ts.employee.first_name} ${ts.employee.last_name} submitted timesheet`,
        description: `Week of ${ts.week_start} - ${ts.total_hours || 0} hours`,
        status: ts.status,
        timestamp: ts.created_at,
        user: {
          name: `${ts.employee.first_name} ${ts.employee.last_name}`,
          role: ts.employee.position_title
        }
      })
    })

    // Add employee updates
    employeeUpdates?.forEach(emp => {
      activities.push({
        id: emp.id,
        type: 'employee_update',
        title: `${emp.first_name} ${emp.last_name} profile updated`,
        description: `Position: ${emp.position_title}`,
        status: 'completed',
        timestamp: emp.updated_at,
        user: {
          name: `${emp.first_name} ${emp.last_name}`,
          role: emp.position_title
        }
      })
    })

    // Sort by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp || '').getTime() - new Date(a.timestamp || '').getTime())

    // Return top 10 activities
    return NextResponse.json(activities.slice(0, 10))
  } catch (error) {
    console.error("Error fetching recent activity:", error)
    return NextResponse.json(
      { error: "Failed to fetch recent activity" },
      { status: 500 }
    )
  }
}
