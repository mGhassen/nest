import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "better-auth"
import { authConfig } from "@/lib/auth"
import { db } from "@/lib/db"
import { employees } from "@/lib/db/schema"
import { getUserWithRole, can } from "@/lib/rbac"
import { eq, and } from "drizzle-orm"
import { z } from "zod"

const createEmployeeSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACTOR"]),
  hireDate: z.string().transform((str) => new Date(str)),
  positionTitle: z.string().optional(),
  baseSalary: z.number().optional(),
  salaryPeriod: z.enum(["MONTHLY", "YEARLY"]).optional(),
  hourlyRate: z.number().optional(),
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
    if (!can(user.role, "read", "employee")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    let employeeQuery = db.query.employees.findMany({
      where: eq(employees.companyId, user.companyId),
      with: {
        location: true,
        costCenter: true,
        workSchedule: true,
      },
    })

    // Filter based on role
    if (user.role === "EMPLOYEE") {
      // Employee can only see themselves
      employeeQuery = db.query.employees.findMany({
        where: and(
          eq(employees.companyId, user.companyId),
          eq(employees.userId, user.id)
        ),
        with: {
          location: true,
          costCenter: true,
          workSchedule: true,
        },
      })
    } else if (user.role === "MANAGER") {
      // Manager can see direct reports
      employeeQuery = db.query.employees.findMany({
        where: and(
          eq(employees.companyId, user.companyId),
          eq(employees.managerId, user.id)
        ),
        with: {
          location: true,
          costCenter: true,
          workSchedule: true,
        },
      })
    }

    const employeesList = await employeeQuery

    return NextResponse.json(employeesList)
  } catch (error) {
    console.error("Error fetching employees:", error)
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
    if (!can(user.role, "write", "employee")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createEmployeeSchema.parse(body)

    const newEmployee = await db.insert(employees).values({
      ...validatedData,
      companyId: user.companyId,
    }).returning()

    return NextResponse.json(newEmployee[0], { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating employee:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
