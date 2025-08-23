import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "better-auth"
import { authConfig } from "@/lib/auth"
import { db } from "@/lib/db"
import { employees } from "@/lib/db/schema"
import { getUserWithRole, can, canAccessEmployee } from "@/lib/rbac"
import { eq } from "drizzle-orm"
import { z } from "zod"

const updateEmployeeSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACTOR"]).optional(),
  hireDate: z.string().transform((str) => new Date(str)).optional(),
  terminationDate: z.string().transform((str) => new Date(str)).optional(),
  positionTitle: z.string().optional(),
  baseSalary: z.number().optional(),
  salaryPeriod: z.enum(["MONTHLY", "YEARLY"]).optional(),
  hourlyRate: z.number().optional(),
  managerId: z.string().optional(),
  locationId: z.string().optional(),
  costCenterId: z.string().optional(),
  workScheduleId: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserWithRole(session.user.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user can access this employee
    const canAccess = await canAccessEmployee(session.user.id, params.id)
    if (!canAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const employee = await db.query.employees.findFirst({
      where: eq(employees.id, params.id),
      with: {
        location: true,
        costCenter: true,
        workSchedule: true,
        manager: true,
        timesheets: true,
        leaveRequests: true,
        payrollRuns: true,
      },
    })

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    return NextResponse.json(employee)
  } catch (error) {
    console.error("Error fetching employee:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const validatedData = updateEmployeeSchema.parse(body)

    const updatedEmployee = await db
      .update(employees)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(employees.id, params.id))
      .returning()

    if (!updatedEmployee[0]) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    return NextResponse.json(updatedEmployee[0])
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating employee:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    if (!can(user.role, "delete", "employee")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const deletedEmployee = await db
      .delete(employees)
      .where(eq(employees.id, params.id))
      .returning()

    if (!deletedEmployee[0]) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Employee deleted successfully" })
  } catch (error) {
    console.error("Error deleting employee:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
