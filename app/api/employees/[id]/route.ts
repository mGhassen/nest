import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/db"
import { can } from "@/lib/rbac"
import { z } from "zod"
import { requireAuth } from "@/lib/middleware/auth"
import type { Database, UserRole } from "@/types/database.types"

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
    if (!can(authResult.user.role as UserRole, "read", "employee")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Fetch employee with related data
    const { data: employee, error } = await supabase
      .from('employees')
      .select(`
        *,
        location:locations(*),
        cost_center:cost_centers(*),
        manager:employees!employees_manager_id_fkey(*),
        work_schedule:work_schedules(*)
      `)
      .eq('id', params.id)
      .single()

    if (error || !employee) {
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
    if (!can(authResult.user.role as UserRole, "write", "employee")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateEmployeeSchema.parse(body)

    // Transform field names to match database schema
    const updateData: Record<string, any> = {
      first_name: validatedData.firstName,
      last_name: validatedData.lastName,
      email: validatedData.email,
      employment_type: validatedData.employmentType,
      manager_id: validatedData.managerId,
      position_title: validatedData.positionTitle,
      location_id: validatedData.locationId,
      cost_center_id: validatedData.costCenterId,
      base_salary: validatedData.baseSalary,
      salary_period: validatedData.salaryPeriod,
      work_schedule_id: validatedData.workScheduleId,
      status: validatedData.status,
      updated_at: new Date().toISOString(),
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    )

    const { data: updatedEmployee, error } = await supabase
      .from('employees')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error || !updatedEmployee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    return NextResponse.json(updatedEmployee)
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
    if (!can(authResult.user.role as UserRole, "delete", "employee")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', params.id)

    if (error) {
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
