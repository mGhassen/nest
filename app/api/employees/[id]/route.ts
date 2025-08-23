import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { employees } from "@/lib/db/schema"
import { can } from "@/lib/rbac"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { requireAuth } from "@/lib/auth-middleware"

const updateEmployeeSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACTOR", "INTERN"]).optional(),
  managerId: z.string().optional(),
  positionTitle: z.string().min(1).optional(),
  locationId: z.string().optional(),
  costCenterId: z.string().optional(),
  baseSalary: z.number().positive().optional(),
  salaryPeriod: z.enum(["HOURLY", "WEEKLY", "BIWEEKLY", "MONTHLY", "YEARLY"]).optional(),
  hourlyRate: z.number().positive().optional(),
  workScheduleId: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "TERMINATED"]).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof NextResponse) return authResult

    // Check permissions
    if (!can(authResult.role, "read", "employee")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const employee = await db.query.employees.findFirst({
      where: eq(employees.id, params.id),
      with: {
        location: true,
        costCenter: true,
        manager: true,
        workSchedule: true,
        timesheets: true,
        leaveRequests: true,
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
    const authResult = await requireAuth(request)
    if (authResult instanceof NextResponse) return authResult

    // Check permissions
    if (!can(authResult.role, "write", "employee")) {
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
    const authResult = await requireAuth(request)
    if (authResult instanceof NextResponse) return authResult

    // Check permissions
    if (!can(authResult.role, "delete", "employee")) {
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
