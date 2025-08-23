import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { timesheets, leaveRequests, employees } from "@/lib/db/schema"
import { eq, and, lt, gte } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const cronKey = request.headers.get("X-CRON-KEY")
    if (cronKey !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const today = new Date()
    const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000)

    // Auto-submit draft timesheets that are past due
    const pastDueTimesheets = await db
      .update(timesheets)
      .set({
        status: "SUBMITTED",
        submittedAt: today,
        updatedAt: today,
      })
      .where(
        and(
          eq(timesheets.status, "DRAFT"),
          lt(timesheets.weekStart, twoWeeksAgo)
        )
      )
      .returning()

    // Send reminders for unsubmitted timesheets
    const unsubmittedTimesheets = await db.query.timesheets.findMany({
      where: and(
        eq(timesheets.status, "DRAFT"),
        gte(timesheets.weekStart, twoWeeksAgo)
      ),
      with: {
        employee: true,
      },
    })

    // TODO: Send email reminders for unsubmitted timesheets
    console.log(`Found ${unsubmittedTimesheets.length} unsubmitted timesheets`)

    // Recalculate leave balances for active employees
    const activeEmployees = await db.query.employees.findMany({
      where: eq(employees.terminationDate, null),
    })

    // TODO: Implement leave balance recalculation logic
    console.log(`Recalculating leave balances for ${activeEmployees.length} employees`)

    return NextResponse.json({
      message: "Daily cron job completed",
      autoSubmittedTimesheets: pastDueTimesheets.length,
      unsubmittedTimesheets: unsubmittedTimesheets.length,
      employeesProcessed: activeEmployees.length,
    })
  } catch (error) {
    console.error("Error in daily cron job:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
