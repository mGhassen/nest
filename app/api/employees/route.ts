import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { employees } from "@/lib/db/schema"
import { can } from "@/lib/rbac"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { requireAuth } from "@/lib/auth-middleware"

const createEmployeeSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACTOR", "INTERN"]),
  managerId: z.string().optional(),
  positionTitle: z.string().min(1),
  locationId: z.string().optional(),
  costCenterId: z.string().optional(),
  baseSalary: z.number().positive().optional(),
  salaryPeriod: z.enum(["HOURLY", "WEEKLY", "BIWEEKLY", "MONTHLY", "YEARLY"]).optional(),
  hourlyRate: z.number().positive().optional(),
  workScheduleId: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    if (user instanceof NextResponse) return user

    // Check permissions
    if (!can(user.role, "read", "employee")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const locationId = searchParams.get("locationId")
    const costCenterId = searchParams.get("costCenterId")

    let query = db.query.employees.findMany({
      where: eq(employees.companyId, user.companyId),
      with: {
        location: true,
        costCenter: true,
        manager: true,
        workSchedule: true,
      },
    })

    // Apply filters if provided
    if (status) {
      query = db.query.employees.findMany({
        where: eq(employees.status, status),
        with: {
          location: true,
          costCenter: true,
          manager: true,
          workSchedule: true,
        },
      })
    }

    const employeesList = await query
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
    const user = await requireAuth(request)
    if (user instanceof NextResponse) return user

    // Check permissions
    if (!can(user.role, "write", "employee")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createEmployeeSchema.parse(body)

    const newEmployee = await db.insert(employees).values({
      ...validatedData,
      companyId: user.companyId,
      status: "ACTIVE",
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
