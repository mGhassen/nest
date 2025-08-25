import { NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from 'next/headers'
import { z } from "zod"
import { requireAuth, requireRole } from "@/lib/middleware/auth"
import { Database } from "@/types/database.types"
import type { EmploymentType, SalaryPeriod } from "@/types/database.types"

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
    const auth = await requireAuth(request)
    if (auth instanceof NextResponse) return auth

    // Check permissions
    if (auth.user.role !== 'admin' && auth.user.role !== 'hr') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const locationId = searchParams.get("locationId")
    const costCenterId = searchParams.get("costCenterId")

    // Build the query
    let query = supabase
      .from('employees')
      .select(`
        *,
        location:locations(*),
        cost_center:cost_centers(*),
        manager:employees!manager_id(*),
        work_schedule:work_schedules(*)
      `)
      .eq('company_id', auth.user.companyId || '')

    // Apply filters if provided
    if (status) {
      query = query.eq('status', status)
    }

    if (locationId) {
      query = query.eq('location_id', locationId)
    }

    if (costCenterId) {
      query = query.eq('cost_center_id', costCenterId)
    }

    const { data: employees, error } = await query

    if (error) {
      console.error("Error fetching employees:", error)
      return NextResponse.json(
        { error: "Failed to fetch employees" },
        { status: 500 }
      )
    }

    return NextResponse.json(employees)
  } catch (error) {
    console.error("Error in GET /api/employees:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if (auth instanceof NextResponse) return auth

    // Check permissions
    if (auth.user.role !== 'admin' && auth.user.role !== 'hr') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const supabase = createRouteHandlerClient<Database>({ cookies })
    const data = await request.json()
    const validation = createEmployeeSchema.safeParse(data)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.format() },
        { status: 400 }
      )
    }

    const employeeData = {
      ...validation.data,
      company_id: auth.user.companyId,
      status: "ACTIVE",
      hire_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: newEmployee, error } = await supabase
      .from('employees')
      .insert(employeeData)
      .select()
      .single()

    if (error) {
      console.error("Error creating employee:", error)
      return NextResponse.json(
        { error: "Failed to create employee" },
        { status: 500 }
      )
    }

    return NextResponse.json(newEmployee, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/employees:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
