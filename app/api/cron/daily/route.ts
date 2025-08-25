import { NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from 'next/headers'
import type { Database } from "@/types/database.types"

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const cronKey = request.headers.get("X-CRON-KEY")
    if (cronKey !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createRouteHandlerClient<Database>({ cookies })
    const today = new Date()
    const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000)

    // Auto-submit draft timesheets that are past due
    const { data: pastDueTimesheets, error: updateError } = await supabase
      .from('timesheets')
      .update({
        status: "SUBMITTED",
        updated_at: today.toISOString(),
      })
      .eq('status', 'DRAFT')
      .lt('week_start', twoWeeksAgo.toISOString().split('T')[0])
      .select()

    if (updateError) {
      console.error("Error updating past due timesheets:", updateError)
    }

    // Send reminders for unsubmitted timesheets
    const { data: unsubmittedTimesheets, error: queryError } = await supabase
      .from('timesheets')
      .select(`
        *,
        employee:employees(*)
      `)
      .eq('status', 'DRAFT')
      .gte('week_start', twoWeeksAgo.toISOString().split('T')[0])

    if (queryError) {
      console.error("Error fetching unsubmitted timesheets:", queryError)
    }

    // TODO: Send email reminders for unsubmitted timesheets
    console.log(`Found ${unsubmittedTimesheets?.length || 0} unsubmitted timesheets`)

    // Recalculate leave balances for active employees
    const { data: activeEmployees, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .eq('status', 'ACTIVE')

    if (employeeError) {
      console.error("Error fetching active employees:", employeeError)
    }

    // TODO: Implement leave balance recalculation logic
    console.log(`Recalculating leave balances for ${activeEmployees?.length || 0} employees`)

    return NextResponse.json({
      message: "Daily cron job completed",
      autoSubmittedTimesheets: pastDueTimesheets?.length || 0,
      unsubmittedTimesheets: unsubmittedTimesheets?.length || 0,
      employeesProcessed: activeEmployees?.length || 0,
    })
  } catch (error) {
    console.error("Error in daily cron job:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
