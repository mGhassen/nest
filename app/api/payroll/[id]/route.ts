import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase"


import { getUserWithRole } from "@/lib/rbac"
import { z } from "zod"
import type { Database } from "@/types/database.types"

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
    const supabase = supabaseServer()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserWithRole(session.user.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Only admin can view payroll details
    if (user.role !== 'OWNER' && user.role !== 'HR') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { data: payrollCycle, error } = await supabase
      .from('payroll_cycles')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !payrollCycle) {
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
    const supabase = supabaseServer()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserWithRole(session.user.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Only admin can update payroll cycles
    if (user.role !== 'OWNER' && user.role !== 'HR') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updatePayrollCycleSchema.parse(body)

    // Transform field names to match database schema
    const updateData = {
      month: validatedData.month,
      year: validatedData.year,
      document_url: validatedData.documentUrl,
      notes: validatedData.notes,
      status: validatedData.status,
      updated_at: new Date().toISOString(),
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => 
      updateData[key as keyof typeof updateData] === undefined && delete updateData[key as keyof typeof updateData]
    )

    const { data: updatedPayrollCycle, error } = await supabase
      .from('payroll_cycles')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error || !updatedPayrollCycle) {
      return NextResponse.json({ error: "Payroll cycle not found" }, { status: 404 })
    }

    return NextResponse.json(updatedPayrollCycle)
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
    const supabase = supabaseServer()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserWithRole(session.user.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Only admin can delete payroll cycles
    if (user.role !== 'OWNER' && user.role !== 'HR') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { error } = await supabase
      .from('payroll_cycles')
      .delete()
      .eq('id', params.id)

    if (error) {
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
