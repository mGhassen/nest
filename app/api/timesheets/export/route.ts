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
    if (!can(user.role, "read", "timesheet")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const employeeId = searchParams.get("employeeId")

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "startDate and endDate are required" },
        { status: 400 }
      )
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    let query = supabase
      .from('timesheets')
      .select(`
        *,
        employee:employees(
          *,
          location:locations(*),
          cost_center:cost_centers(*)
        ),
        entries:timesheet_entries(*)
      `)
      .gte('week_start', start.toISOString().split('T')[0])
      .lte('week_start', end.toISOString().split('T')[0])

    // Filter by employee if provided and user has permission
    if (employeeId) {
      if (user.role === "EMPLOYEE") {
        // Employee can only export their own timesheets
        const { data: employee } = await supabase
          .from('employees')
          .select('id')
          .eq('user_id', user.id)
          .single()
        
        if (employee?.id !== employeeId) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }
      } else if (user.role === "MANAGER") {
        // Manager can only export direct reports' timesheets
        const { data: employee } = await supabase
          .from('employees')
          .select('manager_id')
          .eq('id', employeeId)
          .single()
        
        if (employee?.manager_id !== user.id) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }
      }
      // ADMIN, HR, OWNER can export all timesheets

      query = query.eq('employee_id', employeeId)
    }

    const { data: timesheetsList, error } = await query

    if (error) {
      console.error("Error fetching timesheets:", error)
      return NextResponse.json(
        { error: "Failed to fetch timesheets" },
        { status: 500 }
      )
    }

    // Convert to CSV format
    const csvData = (timesheetsList || []).flatMap(timesheet =>
      (timesheet.entries || []).map((entry: any) => ({
        employee: `${timesheet.employee?.first_name || ''} ${timesheet.employee?.last_name || ''}`,
        date: entry.date,
        hours: entry.hours,
        project: entry.project || '',
        costCenter: timesheet.employee?.cost_center?.name || '',
        location: timesheet.employee?.location?.name || '',
        status: timesheet.status,
        weekStart: timesheet.week_start,
      }))
    )

    // Generate CSV content
    const csvHeaders = ['Employee', 'Date', 'Hours', 'Project', 'Cost Center', 'Location', 'Status', 'Week Start']
    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => [
        `"${row.employee}"`,
        row.date,
        row.hours,
        `"${row.project}"`,
        `"${row.costCenter}"`,
        `"${row.location}"`,
        row.status,
        row.weekStart,
      ].join(','))
    ].join('\n')

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="timesheets_${startDate}_${endDate}.csv"`,
      },
    })
  } catch (error) {
    console.error("Error exporting timesheets:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
