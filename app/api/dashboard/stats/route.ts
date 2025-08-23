import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { authConfig } from "@/lib/auth"
import { db } from "@/lib/db"
import { employees, timesheets, leaveRequests, payrollCycles } from "@/lib/db/schema"
import { getUserWithRole } from "@/lib/rbac"
import { eq, and, count, sql } from "drizzle-orm"

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

    // Get company stats
    const totalEmployees = await db
      .select({ count: count() })
      .from(employees)
      .where(eq(employees.companyId, user.companyId))

    const pendingTimesheets = await db
      .select({ count: count() })
      .from(timesheets)
      .where(
        and(
          eq(timesheets.status, "SUBMITTED"),
          sql`${timesheets.employeeId} IN (
            SELECT id FROM employees WHERE company_id = ${user.companyId}
          )`
        )
      )

    const pendingLeaveRequests = await db
      .select({ count: count() })
      .from(leaveRequests)
      .where(
        and(
          eq(leaveRequests.status, "SUBMITTED"),
          sql`${leaveRequests.employeeId} IN (
            SELECT id FROM employees WHERE company_id = ${user.companyId}
          )`
        )
      )

    const activePayrollCycles = await db
      .select({ count: count() })
      .from(payrollCycles)
      .where(
        and(
          eq(payrollCycles.companyId, user.companyId),
          eq(payrollCycles.status, "UPLOADED")
        )
      )

    // Get role-specific stats
    let roleSpecificStats = {}

    if (user.role === "EMPLOYEE") {
      // Employee can only see their own stats
      const employee = await db.query.employees.findFirst({
        where: eq(employees.userId, user.id),
      })

      if (employee) {
        const myPendingTimesheets = await db
          .select({ count: count() })
          .from(timesheets)
          .where(
            and(
              eq(timesheets.employeeId, employee.id),
              eq(timesheets.status, "SUBMITTED")
            )
          )

        const myPendingLeaveRequests = await db
          .select({ count: count() })
          .from(leaveRequests)
          .where(
            and(
              eq(leaveRequests.employeeId, employee.id),
              eq(leaveRequests.status, "SUBMITTED")
            )
          )

        roleSpecificStats = {
          myPendingTimesheets: myPendingTimesheets[0].count,
          myPendingLeaveRequests: myPendingLeaveRequests[0].count,
        }
      }
    } else if (user.role === "MANAGER") {
      // Manager can see direct reports' stats
      const directReports = await db.query.employees.findMany({
        where: eq(employees.managerId, user.id),
      })

      const directReportIds = directReports.map(emp => emp.id)

      const directReportsPendingTimesheets = await db
        .select({ count: count() })
        .from(timesheets)
        .where(
          and(
            sql`${timesheets.employeeId} IN (${sql.join(directReportIds, sql`, `)})`,
            eq(timesheets.status, "SUBMITTED")
          )
        )

      const directReportsPendingLeaveRequests = await db
        .select({ count: count() })
        .from(leaveRequests)
        .where(
          and(
            sql`${leaveRequests.employeeId} IN (${sql.join(directReportIds, sql`, `)})`,
            eq(leaveRequests.status, "SUBMITTED")
          )
        )

      roleSpecificStats = {
        directReportsCount: directReports.length,
        directReportsPendingTimesheets: directReportsPendingTimesheets[0].count,
        directReportsPendingLeaveRequests: directReportsPendingLeaveRequests[0].count,
      }
    }

    const stats = {
      totalEmployees: totalEmployees[0].count,
      pendingTimesheets: pendingTimesheets[0].count,
      pendingLeaveRequests: pendingLeaveRequests[0].count,
      activePayrollCycles: activePayrollCycles[0].count,
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
