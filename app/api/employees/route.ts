import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from '@/lib/supabase'
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

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Starting employees GET request")
    
    const supabase = supabaseServer()
    
    // Get user from auth header instead of session
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log("❌ No auth header found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const token = authHeader.replace('Bearer ', '')
    console.log("✅ Token found, length:", token.length)

    // Simple query - get all employees
    console.log("🔍 Executing database query...")
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select(`
        id,
        first_name,
        last_name,
        email,
        hire_date,
        employment_type,
        position_title,
        base_salary,
        salary_period,
        status,
        created_at,
        updated_at
      `)

    console.log("🔍 Query result:", { data: employees, error: employeesError, count: employees?.length })

    if (employeesError) {
      console.error("❌ Error fetching employees:", employeesError)
      return NextResponse.json({ error: "Failed to fetch employees", details: employeesError }, { status: 500 })
    }

    console.log(`✅ Found ${employees?.length || 0} employees`)
    
    return NextResponse.json({
      employees: employees || [],
      count: employees?.length || 0
    })
    
  } catch (error) {
    console.error("💥 Employees API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseServer()
    
    // Get user from auth header instead of session
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }
    
    const token = authHeader.replace('Bearer ', '')
    
    // Verify the token and get user info
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Get user profile from accounts table
    const { data: userProfile, error: profileError } = await supabase
      .from('accounts')
      .select('*')
      .eq('auth_user_id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    // Check permissions
    if (!['OWNER', 'HR', 'MANAGER'].includes(userProfile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = insertEmployeeSchema.parse(body)

    // Get user's company membership
    const { data: membership } = await supabase
      .from('memberships')
      .select('company_id')
      .eq('user_id', userProfile.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: "No company found" }, { status: 404 })
    }

    // Create the employee record - user_id will be null (optional now)
    const employeeData = { 
      ...validatedData, 
      company_id: membership.company_id,
      hire_date: validatedData.hire_date.toISOString().split('T')[0],
      // user_id is optional and will be null by default
    }

    const { data: newEmployee, error } = await supabase
      .from('employees')
      .insert(employeeData)
      .select()
      .single()

    if (error) {
      console.error("Error creating employee:", error)
      return NextResponse.json(
        { error: "Failed to create employee", details: error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      employee: newEmployee
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating employee:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error },
      { status: 500 }
    )
  }
} 
