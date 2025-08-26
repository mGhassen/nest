import { NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from 'next/headers'
import { getUserWithRole, can } from "@/lib/rbac"
import { z } from "zod"
import type { Database } from "@/types/database.types"

const insertEmployeeSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  position_title: z.string().min(1),
  department: z.string().min(1),
  hire_date: z.string().transform((str) => new Date(str)),
  salary: z.number().positive().optional(),
  manager_id: z.string().optional(),
  is_active: z.boolean().default(true),
})

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
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

    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get("companyId")
    const status = searchParams.get("status")

    let query = supabase
      .from('employees')
      .select(`
        *,
        manager:employees!employees_manager_id_fkey(
          id,
          first_name,
          last_name,
          email
        ),
        department:departments(name),
        company:companies(name)
      `)

    // Filter by company if provided
    if (companyId) {
      query = query.eq('company_id', companyId)
    }

    // Filter by status if provided
    if (status === 'active') {
      query = query.eq('is_active', true)
    } else if (status === 'inactive') {
      query = query.eq('is_active', false)
    }

    // Role-based filtering
    if (user.role === "MANAGER") {
      // Manager can only see direct reports
      query = query.eq('manager_id', user.id)
    } else if (user.role === "EMPLOYEE") {
      // Employee can only see themselves
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single()
      
      if (employee) {
        query = query.eq('id', employee.id)
      }
    }
    // ADMIN, HR, OWNER can see all employees

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
    console.error("Error fetching employees:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
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

    const body = await request.json()
    const validatedData = insertEmployeeSchema.parse(body)

    // Get user's company membership
    const { data: membership } = await supabase
      .from('company_memberships')
      .select('company_id')
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: "No company found" }, { status: 404 })
    }

    // Ensure companyId is set to user's company
    const employeeData = { 
      ...validatedData, 
      company_id: membership.company_id,
      hire_date: validatedData.hire_date.toISOString().split('T')[0]
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
