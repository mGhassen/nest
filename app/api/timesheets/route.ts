import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { authConfig } from "@/lib/auth"
import { db } from "@/lib/db"
import { timesheets, timesheetEntries } from "@/lib/db/schema"
import { getUserWithRole, can } from "@/lib/rbac"
import { eq, and, gte, lte } from "drizzle-orm"
import { z } from "zod"

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
    const weekStart = searchParams.get("weekStart")
    const employeeId = searchParams.get("employeeId")

    let query = db.query.timesheets.findMany({
      with: {
        employee: true,
        entries: true,
      },
    })

    // Filter by week if provided
    if (weekStart) {
      const startDate = new Date(weekStart)
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 7)

      query = db.query.timesheets.findMany({
        where: and(
          gte(timesheets.weekStart, startDate),
          lte(timesheets.weekStart, endDate)
        ),
        with: {
          employee: true,
          entries: true,
        },
      })
    }

    // Filter by employee if provided and user has permission
    if (employeeId) {
      if (user.role === "EMPLOYEE") {
        // Employee can only see their own timesheets
        const employee = await db.query.employees.findFirst({
          where: eq(employees.userId, user.id),
        })
        if (employee?.id !== employeeId) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }
      } else if (user.role === "MANAGER") {
        // Manager can only see direct reports' timesheets
        const employee = await db.query.employees.findFirst({
          where: eq(employees.id, employeeId),
        })
        if (employee?.managerId !== user.id) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }
      }
      // ADMIN, HR, OWNER can see all timesheets

      query = db.query.timesheets.findMany({
        where: eq(timesheets.employeeId, employeeId),
        with: {
          employee: true,
          entries: true,
        },
      })
    }

    const timesheetsList = await query
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
    const session = await getServerSession(authConfig)
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
      const employee = await db.query.employees.findFirst({
        where: eq(employees.userId, user.id),
      })
      if (employee?.id !== validatedData.employeeId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    // Create timesheet
    const newTimesheet = await db.insert(timesheets).values({
      employeeId: validatedData.employeeId,
      weekStart: validatedData.weekStart,
      status: "DRAFT",
    }).returning()

    // Create timesheet entries
    const entries = validatedData.entries.map(entry => ({
      timesheetId: newTimesheet[0].id,
      ...entry,
    }))

    await db.insert(timesheetEntries).values(entries)

    return NextResponse.json(newTimesheet[0], { status: 201 })
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
