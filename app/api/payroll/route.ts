import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "better-auth"
import { authConfig } from "@/lib/auth"
import { db } from "@/lib/db"
import { payrollCycles, payrollRuns } from "@/lib/db/schema"
import { getUserWithRole, can } from "@/lib/rbac"
import { eq, and } from "drizzle-orm"
import { z } from "zod"

const createPayrollCycleSchema = z.object({
  periodStart: z.string().transform((str) => new Date(str)),
  periodEnd: z.string().transform((str) => new Date(str)),
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
    if (!can(user.role, "read", "payroll")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    let query = db.query.payrollCycles.findMany({
      where: eq(payrollCycles.companyId, user.companyId),
      with: {
        runs: {
          with: {
            employee: true,
          },
        },
      },
    })

    // Filter by status if provided
    if (status) {
      query = db.query.payrollCycles.findMany({
        where: and(
          eq(payrollCycles.companyId, user.companyId),
          eq(payrollCycles.status, status)
        ),
        with: {
          runs: {
            with: {
              employee: true,
            },
          },
        },
      })
    }

    const payrollCyclesList = await query
    return NextResponse.json(payrollCyclesList)
  } catch (error) {
    console.error("Error fetching payroll cycles:", error)
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
    if (!can(user.role, "write", "payroll")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createPayrollCycleSchema.parse(body)

    const newPayrollCycle = await db.insert(payrollCycles).values({
      ...validatedData,
      companyId: user.companyId,
      status: "DRAFT",
    }).returning()

    return NextResponse.json(newPayrollCycle[0], { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating payroll cycle:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
