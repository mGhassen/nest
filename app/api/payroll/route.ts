import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase"


import { getUserWithRole, can } from "@/lib/rbac"
import { z } from "zod"
import type { Database } from "@/types/database.types"

const createPayrollCycleSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2030),
  documentUrl: z.string().url().optional(),
  notes: z.string().optional(),
})

export async function GET(request: NextRequest) {
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

    // Check permissions
    if (!can(user.role, "read", "payroll")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month")
    const year = searchParams.get("year")

    let query = supabase
      .from('payroll_cycles')
      .select('*')
      .eq('company_id', user.company_id || '')
      .order('year', { ascending: false })
      .order('month', { ascending: false })

    // Filter by month and year if provided
    if (month && year) {
      query = query
        .eq('month', parseInt(month))
        .eq('year', parseInt(year))
    }

    const { data: payrollCyclesList, error } = await query

    if (error) {
      console.error("Error fetching payroll cycles:", error)
      return NextResponse.json(
        { error: "Failed to fetch payroll cycles" },
        { status: 500 }
      )
    }

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
    const supabase = supabaseServer()
    const { data: { session } } = await supabase.auth.getSession()
    
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
    const { data: existingCycle, error: checkError } = await supabase
      .from('payroll_cycles')
      .select('*')
      .eq('company_id', user.company_id || '')
      .eq('month', validatedData.month)
      .eq('year', validatedData.year)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error("Error checking existing payroll cycle:", checkError)
      return NextResponse.json(
        { error: "Failed to check existing payroll cycle" },
        { status: 500 }
      )
    }

    if (existingCycle) {
      return NextResponse.json(
        { error: "Payroll cycle already exists for this month/year" },
        { status: 400 }
      )
    }

    const newPayrollCycleData = {
      company_id: user.company_id || '',
      month: validatedData.month,
      year: validatedData.year,
      document_url: validatedData.documentUrl,
      notes: validatedData.notes,
      status: "UPLOADED",
    }

    const { data: newPayrollCycle, error } = await supabase
      .from('payroll_cycles')
      .insert(newPayrollCycleData)
      .select()
      .single()

    if (error) {
      console.error("Error creating payroll cycle:", error)
      return NextResponse.json(
        { error: "Failed to create payroll cycle" },
        { status: 500 }
      )
    }

    return NextResponse.json(newPayrollCycle, { status: 201 })
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
