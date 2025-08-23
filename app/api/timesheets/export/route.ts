import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { authConfig } from "@/lib/auth"
import { db } from "@/lib/db"
import { timesheets, timesheetEntries, employees } from "@/lib/db/schema"
import { getUserWithRole, can } from "@/lib/rbac"
import { eq, and, gte, lte } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
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

    let query = db.query.timesheets.findMany({
      where: and(
        gte(timesheets.weekStart, start),
        lte(timesheets.weekStart, end)
      ),
      with: {
        employee: {
          with: {
            location: true,
            costCenter: true,
          },
        },
        entries: true,
      },
    })

    // Filter by employee if provided and user has permission
    if (employeeId) {
      if (user.role === "EMPLOYEE") {
        // Employee can only export their own timesheets
        const employee = await db.query.employees.findFirst({
          where: eq(employees.userId, user.id),
        })
        if (employee?.id !== employeeId) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }
      } else if (user.role === "MANAGER") {
        // Manager can only export direct reports' timesheets
        const employee = await db.query.employees.findFirst({
          where: eq(employees.id, employeeId),
        })
        if (employee?.managerId !== user.id) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }
      }
      // ADMIN, HR, OWNER can export all timesheets

      query = db.query.timesheets.findMany({
        where: and(
          eq(timesheets.employeeId, employeeId),
          gte(timesheets.weekStart, start),
          lte(timesheets.weekStart, end)
        ),
        with: {
          employee: {
            with: {
              location: true,
              costCenter: true,
            },
          },
          entries: true,
        },
      })
    }

    const timesheetsList = await query

    // Convert to CSV format
    const csvData = timesheetsList.flatMap(timesheet =>
      timesheet.entries.map(entry => ({
        employee: `${timesheet.employee.firstName} ${timesheet.employee.lastName}`,
        date: entry.date.toISOString().split('T')[0],
        hours: entry.hours,
        project: entry.project || '',
        costCenter: timesheet.employee.costCenter?.name || '',
        location: timesheet.employee.location?.name || '',
        status: timesheet.status,
        weekStart: timesheet.weekStart.toISOString().split('T')[0],
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
