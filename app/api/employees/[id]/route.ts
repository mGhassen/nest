import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase"


import { getUserWithRole, can } from "@/lib/rbac"
import { z } from "zod"
import type { Database } from "@/types/database.types"

const insertEmployeeSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  hire_date: z.string().transform((str) => new Date(str)),
  employment_type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACTOR', 'INTERN']),
  position_title: z.string().min(1),
  base_salary: z.number().positive(),
  salary_period: z.enum(['HOURLY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'YEARLY']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'TERMINATED', 'ON_LEAVE']).default('ACTIVE'),
  manager_id: z.string().optional(),
  location_id: z.string().optional(),
  cost_center_id: z.string().optional(),
  work_schedule_id: z.string().optional(),
})

const updateEmployeeSchema = insertEmployeeSchema.partial()

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

    // Check permissions
    if (!can(user.role, "read", "employee")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = params

    // Role-based access control
    if (user.role === "EMPLOYEE") {
      // Employee can only see themselves
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single()
      
      if (employee?.id !== id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    } else if (user.role === "MANAGER") {
      // Manager can only see direct reports
      const { data: employee } = await supabase
        .from('employees')
        .select('manager_id')
        .eq('id', id)
        .single()
      
      if (employee?.manager_id !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }
    // ADMIN, HR, OWNER can see all employees

    const { data: employee, error } = await supabase
      .from('employees')
      .select(`
        *,
        manager:employees!employees_manager_id_fkey(
          id,
          first_name,
          last_name,
          email
        ),
        location:locations(name),
        cost_center:cost_centers(name),
        work_schedule:work_schedules(name)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: "Employee not found" }, { status: 404 })
      }
      console.error("Error fetching employee:", error)
      return NextResponse.json(
        { error: "Failed to fetch employee", details: error },
        { status: 500 }
      )
    }

    return NextResponse.json(employee)
  } catch (error) {
    console.error("Error fetching employee:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error },
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

    // Check permissions
    if (!can(user.role, "write", "employee")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = params
    const body = await request.json()
    const validatedData = updateEmployeeSchema.parse(body)

    // Role-based access control
    if (user.role === "EMPLOYEE") {
      // Employee can only update themselves
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single()
      
      if (employee?.id !== id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    } else if (user.role === "MANAGER") {
      // Manager can only update direct reports
      const { data: employee } = await supabase
        .from('employees')
        .select('manager_id')
        .eq('id', id)
        .single()
      
      if (employee?.manager_id !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }
    // ADMIN, HR, OWNER can update all employees

    // Transform date if provided
    if (validatedData.hire_date) {
      validatedData.hire_date = validatedData.hire_date.toISOString().split('T')[0] as any
    }

    const { data: updatedEmployee, error } = await supabase
      .from('employees')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error("Error updating employee:", error)
      return NextResponse.json(
        { error: "Failed to update employee", details: error },
        { status: 500 }
      )
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
      { error: "Internal server error", details: error },
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

    // Check permissions
    if (!can(user.role, "delete", "employee")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = params

    // Only ADMIN, HR, OWNER can delete employees
    if (user.role === "EMPLOYEE" || user.role === "MANAGER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id)

    if (error) {
      console.error("Error deleting employee:", error)
      return NextResponse.json(
        { error: "Failed to delete employee", details: error },
        { status: 500 }
      )
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error deleting employee:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error },
      { status: 500 }
    )
  }
} 
