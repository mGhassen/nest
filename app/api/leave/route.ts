import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { authConfig } from "@/lib/auth"
import { db } from "@/lib/db"
import { leaveRequests } from "@/lib/db/schema"
import { getUserWithRole, can } from "@/lib/rbac"
import { eq, and } from "drizzle-orm"
import { z } from "zod"

const createLeaveRequestSchema = z.object({
  employeeId: z.string(),
  policyId: z.string(),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  unit: z.enum(["DAYS", "HOURS"]),
  quantity: z.number().positive(),
  reason: z.string().optional(),
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
    if (!can(user.role, "read", "leave")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get("employeeId")
    const status = searchParams.get("status")

    let query = db.query.leaveRequests.findMany({
      with: {
        employee: true,
        policy: true,
        approver: true,
      },
    })

    // Filter by employee if provided
    if (employeeId) {
      if (user.role === "EMPLOYEE") {
        // Employee can only see their own leave requests
        const employee = await db.query.employees.findFirst({
          where: eq(employees.userId, user.id),
        })
        if (employee?.id !== employeeId) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }
      } else if (user.role === "MANAGER") {
        // Manager can only see direct reports' leave requests
        const employee = await db.query.employees.findFirst({
          where: eq(employees.id, employeeId),
        })
        if (employee?.managerId !== user.id) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }
      }
      // ADMIN, HR, OWNER can see all leave requests

      query = db.query.leaveRequests.findMany({
        where: eq(leaveRequests.employeeId, employeeId),
        with: {
          employee: true,
          policy: true,
          approver: true,
        },
      })
    }

    // Filter by status if provided
    if (status) {
      query = db.query.leaveRequests.findMany({
        where: eq(leaveRequests.status, status),
        with: {
          employee: true,
          policy: true,
          approver: true,
        },
      })
    }

    const leaveRequestsList = await query
    return NextResponse.json(leaveRequestsList)
  } catch (error) {
    console.error("Error fetching leave requests:", error)
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
    if (!can(user.role, "write", "leave")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createLeaveRequestSchema.parse(body)

    // Check if user can create leave request for this employee
    if (user.role === "EMPLOYEE") {
      const employee = await db.query.employees.findFirst({
        where: eq(employees.userId, user.id),
      })
      if (employee?.id !== validatedData.employeeId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    const newLeaveRequest = await db.insert(leaveRequests).values({
      ...validatedData,
      status: "DRAFT",
    }).returning()

    return NextResponse.json(newLeaveRequest[0], { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating leave request:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
