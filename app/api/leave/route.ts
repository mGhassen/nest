import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase"
import { getUserWithRole, can } from "@/lib/rbac"
import { z } from "zod"
import type { Database } from "@/types/database.types"

const createLeaveRequestSchema = z.object({
  employeeId: z.string(),
  policyId: z.string(),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  unit: z.enum(["DAYS", "HOURS"]),
  quantity: z.number().positive(),
  reason: z.string().optional(),
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
    if (!can(user.role, "read", "leave")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get("employeeId")
    const status = searchParams.get("status")

    let query = supabase
      .from('leave_requests')
      .select(`
        *,
        employee:employees(*),
        policy:leave_policies(*),
        approver:employees!leave_requests_approved_by_fkey(*)
      `)

    // Filter by employee if provided
    if (employeeId) {
      if (user.role === "EMPLOYEE") {
        // Employee can only see their own leave requests
        const { data: employee } = await supabase
          .from('employees')
          .select('id')
          .eq('user_id', user.id)
          .single()
        
        if (employee?.id !== employeeId) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }
      } else if (user.role === "MANAGER") {
        // Manager can only see direct reports' leave requests
        const { data: employee } = await supabase
          .from('employees')
          .select('manager_id')
          .eq('id', employeeId)
          .single()
        
        if (employee?.manager_id !== user.id) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }
      }
      // ADMIN, HR, OWNER can see all leave requests

      query = query.eq('employee_id', employeeId)
    }

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status)
    }

    const { data: leaveRequestsList, error } = await query

    if (error) {
      console.error("Error fetching leave requests:", error)
      return NextResponse.json(
        { error: "Failed to fetch leave requests" },
        { status: 500 }
      )
    }

    return NextResponse.json(leaveRequestsList)
  } catch (error) {
    console.error("Error fetching leave requests:", error)
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
    if (!can(user.role, "write", "leave")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createLeaveRequestSchema.parse(body)

    // Check if user can create leave request for this employee
    if (user.role === "EMPLOYEE") {
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single()
      
      if (employee?.id !== validatedData.employeeId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    // Calculate days requested
    const startDate = validatedData.startDate
    const endDate = validatedData.endDate
    const daysRequested = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

    const newLeaveRequestData = {
      employee_id: validatedData.employeeId,
      leave_policy_id: validatedData.policyId,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      days_requested: daysRequested,
      reason: validatedData.reason,
      status: "PENDING",
    }

    const { data: newLeaveRequest, error } = await supabase
      .from('leave_requests')
      .insert(newLeaveRequestData)
      .select()
      .single()

    if (error) {
      console.error("Error creating leave request:", error)
      return NextResponse.json(
        { error: "Failed to create leave request" },
        { status: 500 }
      )
    }

    return NextResponse.json(newLeaveRequest, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating leave request:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
