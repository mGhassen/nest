import { NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from 'next/headers'
import { getUserWithRole, can } from "@/lib/rbac"
import { z } from "zod"
import type { Database } from "@/types/database.types"

const createTimesheetSchema = z.object({
  employeeId: z.string(),
  weekStart: z.string().transform((str) => new Date(str)),
  entries: z.array(z.object({
    date: z.string().transform((str) => new Date(str)),
    project: z.string().optional(),
    hours: z.number().min(0).max(24),
    notes: z.string().optional(),
  })),
})

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
    if (!can(user.role, "read", "timesheet")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const weekStart = searchParams.get("weekStart")
    const employeeId = searchParams.get("employeeId")

    let query = supabase
      .from('timesheets')
      .select(`
        *,
        employee:employees(*),
        entries:timesheet_entries(*)
      `)

    // Filter by week if provided
    if (weekStart) {
      const startDate = new Date(weekStart)
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 7)

      query = query
        .gte('week_start', startDate.toISOString().split('T')[0])
        .lte('week_start', endDate.toISOString().split('T')[0])
    }

    // Filter by employee if provided and user has permission
    if (employeeId) {
      if (user.role === "EMPLOYEE") {
        // Employee can only see their own timesheets
        const { data: employee } = await supabase
          .from('employees')
          .select('id')
          .eq('user_id', user.id)
          .single()
        
        if (employee?.id !== employeeId) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }
      } else if (user.role === "MANAGER") {
        // Manager can only see direct reports' timesheets
        const { data: employee } = await supabase
          .from('employees')
          .select('manager_id')
          .eq('id', employeeId)
          .single()
        
        if (employee?.manager_id !== user.id) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }
      }
      // ADMIN, HR, OWNER can see all timesheets

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

    return NextResponse.json(timesheetsList)
  } catch (error) {
    console.error("Error fetching timesheets:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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
    if (!can(user.role, "write", "timesheet")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createTimesheetSchema.parse(body)

    // Check if user can create timesheet for this employee
    if (user.role === "EMPLOYEE") {
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single()
      
      if (employee?.id !== validatedData.employeeId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    // Create timesheet
    const newTimesheetData = {
      employee_id: validatedData.employeeId,
      week_start: validatedData.weekStart.toISOString().split('T')[0],
      status: "DRAFT",
    }

    const { data: newTimesheet, error: timesheetError } = await supabase
      .from('timesheets')
      .insert(newTimesheetData)
      .select()
      .single()

    if (timesheetError) {
      console.error("Error creating timesheet:", timesheetError)
      return NextResponse.json(
        { error: "Failed to create timesheet" },
        { status: 500 }
      )
    }

    // Create timesheet entries
    const entries = validatedData.entries.map(entry => ({
      timesheet_id: newTimesheet.id,
      date: entry.date.toISOString().split('T')[0],
      project: entry.project,
      hours: entry.hours,
      notes: entry.notes,
    }))

    const { error: entriesError } = await supabase
      .from('timesheet_entries')
      .insert(entries)

    if (entriesError) {
      console.error("Error creating timesheet entries:", entriesError)
      // Try to clean up the timesheet if entries creation fails
      await supabase
        .from('timesheets')
        .delete()
        .eq('id', newTimesheet.id)
      
      return NextResponse.json(
        { error: "Failed to create timesheet entries" },
        { status: 500 }
      )
    }

    return NextResponse.json(newTimesheet, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating timesheet:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
