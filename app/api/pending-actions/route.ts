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
      .from('company_memberships')
      .select('company_id')
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: "No company found" }, { status: 404 })
    }

    const companyId = membership.company_id

    const pendingActions = []

    // Get pending timesheet approvals
    if (can(user.role, "approve", "timesheet")) {
      const { data: pendingTimesheets } = await supabase
        .from('timesheets')
        .select(`
          id,
          week_start,
          total_hours,
          employee:employees!inner(
            id,
            first_name,
            last_name,
            position_title
          )
        `)
        .eq('company_id', companyId)
        .eq('status', 'SUBMITTED')
        .order('created_at', { ascending: true })
        .limit(5)

      pendingTimesheets?.forEach(ts => {
        pendingActions.push({
          id: ts.id,
          type: 'timesheet_approval',
          title: 'Timesheet Approval Required',
          description: `${ts.employee.first_name} ${ts.employee.last_name} - Week of ${ts.week_start}`,
          priority: 'medium',
          timestamp: ts.created_at,
          user: {
            name: `${ts.employee.first_name} ${ts.employee.last_name}`,
            role: ts.employee.position_title
          },
          actionUrl: `/admin/timesheets/${ts.id}/approve`
        })
      })
    }

    // Get pending leave request approvals
    if (can(user.role, "approve", "leave")) {
      const { data: pendingLeaveRequests } = await supabase
        .from('leave_requests')
        .select(`
          id,
          start_date,
          end_date,
          reason,
          employee:employees!inner(
            id,
            first_name,
            last_name,
            position_title
          )
        `)
        .eq('company_id', companyId)
        .eq('status', 'SUBMITTED')
        .order('created_at', { ascending: true })
        .limit(5)

      pendingLeaveRequests?.forEach(lr => {
        pendingActions.push({
          id: lr.id,
          type: 'leave_approval',
          title: 'Leave Request Approval Required',
          description: `${lr.employee.first_name} ${lr.employee.last_name} - ${lr.start_date} to ${lr.end_date}`,
          priority: 'high',
          timestamp: lr.created_at,
          user: {
            name: `${lr.employee.first_name} ${lr.employee.last_name}`,
            role: lr.employee.position_title
          },
          actionUrl: `/admin/leave/${lr.id}/approve`
        })
      })
    }

    // Get pending employee onboarding
    if (can(user.role, "write", "employee")) {
      const { data: pendingOnboarding } = await supabase
        .from('employees')
        .select(`
          id,
          first_name,
          last_name,
          position_title,
          created_at
        `)
        .eq('company_id', companyId)
        .eq('is_active', true)
        .is('onboarding_completed', false)
        .order('created_at', { ascending: true })
        .limit(3)

      pendingOnboarding?.forEach(emp => {
        pendingActions.push({
          id: emp.id,
          type: 'employee_onboarding',
          title: 'Employee Onboarding Required',
          description: `${emp.first_name} ${emp.last_name} - ${emp.position_title}`,
          priority: 'medium',
          timestamp: emp.created_at,
          user: {
            name: `${emp.first_name} ${emp.last_name}`,
            role: emp.position_title
          },
          actionUrl: `/admin/employees/${emp.id}/onboarding`
        })
      })
    }

    // Get payroll processing reminders
    if (can(user.role, "write", "payroll")) {
      const currentDate = new Date()
      const currentMonth = currentDate.getMonth() + 1
      const currentYear = currentDate.getFullYear()

      const { data: existingPayroll } = await supabase
        .from('payroll_cycles')
        .select('status')
        .eq('company_id', companyId)
        .eq('month', currentMonth)
        .eq('year', currentYear)
        .single()

      if (!existingPayroll || existingPayroll.status === 'DRAFT') {
        pendingActions.push({
          id: `payroll-${currentMonth}-${currentYear}`,
          type: 'payroll_processing',
          title: 'Payroll Processing Due',
          description: `Process payroll for ${currentMonth}/${currentYear}`,
          priority: 'high',
          timestamp: new Date().toISOString(),
          user: {
            name: 'System',
            role: 'System'
          },
          actionUrl: '/admin/payroll/process'
        })
      }
    }

    // Sort by priority and timestamp
    pendingActions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const priorityDiff = priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder]
      
      if (priorityDiff !== 0) return priorityDiff
      
      return new Date(a.timestamp || '').getTime() - new Date(b.timestamp || '').getTime()
    })

    return NextResponse.json(pendingActions)
  } catch (error) {
    console.error("Error fetching pending actions:", error)
    return NextResponse.json(
      { error: "Failed to fetch pending actions" },
      { status: 500 }
    )
  }
}
