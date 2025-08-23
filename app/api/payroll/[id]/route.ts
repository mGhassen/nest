import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "better-auth"
import { authConfig } from "@/lib/auth"
import { db } from "@/lib/db"
import { payrollCycles } from "@/lib/db/schema"
import { getUserWithRole, can } from "@/lib/rbac"
import { eq } from "drizzle-orm"
import { z } from "zod"

const updatePayrollCycleSchema = z.object({
  month: z.number().min(1).max(12).optional(),
  year: z.number().min(2020).max(2030).optional(),
  documentUrl: z.string().url().optional(),
  notes: z.string().optional(),
  status: z.enum(["UPLOADED", "APPROVED", "ARCHIVED"]).optional(),
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

    // Check permissions
    if (!can(user.role, "read", "payroll")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const payrollCycle = await db.query.payrollCycles.findFirst({
      where: eq(payrollCycles.id, params.id),
    })

    if (!payrollCycle) {
      return NextResponse.json({ error: "Payroll cycle not found" }, { status: 404 })
    }

    return NextResponse.json(payrollCycle)
  } catch (error) {
    console.error("Error fetching payroll cycle:", error)
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
    if (!can(user.role, "write", "payroll")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updatePayrollCycleSchema.parse(body)

    const updatedPayrollCycle = await db
      .update(payrollCycles)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(payrollCycles.id, params.id))
      .returning()

    if (!updatedPayrollCycle[0]) {
      return NextResponse.json({ error: "Payroll cycle not found" }, { status: 404 })
    }

    return NextResponse.json(updatedPayrollCycle[0])
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating payroll cycle:", error)
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
    if (!can(user.role, "delete", "payroll")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const deletedPayrollCycle = await db
      .delete(payrollCycles)
      .where(eq(payrollCycles.id, params.id))
      .returning()

    if (!deletedPayrollCycle[0]) {
      return NextResponse.json({ error: "Payroll cycle not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Payroll cycle deleted successfully" })
  } catch (error) {
    console.error("Error deleting payroll cycle:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
