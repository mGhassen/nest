import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "better-auth"
import { authConfig } from "@/lib/auth"
import { db } from "@/lib/db"
import { payrollCycles } from "@/lib/db/schema"
import { getUserWithRole, can } from "@/lib/rbac"
import { eq, and, desc } from "drizzle-orm"
import { z } from "zod"

const createPayrollCycleSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2030),
  documentUrl: z.string().url().optional(),
  notes: z.string().optional(),
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
    const month = searchParams.get("month")
    const year = searchParams.get("year")

    let query = db.query.payrollCycles.findMany({
      where: eq(payrollCycles.companyId, user.companyId),
      orderBy: [desc(payrollCycles.year), desc(payrollCycles.month)],
    })

    // Filter by month and year if provided
    if (month && year) {
      query = db.query.payrollCycles.findMany({
        where: and(
          eq(payrollCycles.companyId, user.companyId),
          eq(payrollCycles.month, parseInt(month)),
          eq(payrollCycles.year, parseInt(year))
        ),
        orderBy: [desc(payrollCycles.year), desc(payrollCycles.month)],
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

    // Check if payroll cycle already exists for this month/year
    const existingCycle = await db.query.payrollCycles.findFirst({
      where: and(
        eq(payrollCycles.companyId, user.companyId),
        eq(payrollCycles.month, validatedData.month),
        eq(payrollCycles.year, validatedData.year)
      ),
    })

    if (existingCycle) {
      return NextResponse.json(
        { error: "Payroll cycle already exists for this month/year" },
        { status: 400 }
      )
    }

    const newPayrollCycle = await db.insert(payrollCycles).values({
      companyId: user.companyId,
      month: validatedData.month,
      year: validatedData.year,
      documentUrl: validatedData.documentUrl,
      notes: validatedData.notes,
      status: "UPLOADED",
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
