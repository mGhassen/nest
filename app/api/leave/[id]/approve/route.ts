import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase"


import { canApproveLeave } from "@/lib/rbac"
import { z } from "zod"
import type { Database } from "@/types/database.types"

const approveLeaveRequestSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  notes: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = supabaseServer()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user can approve this leave request
    const canApprove = await canApproveLeave(session.user.id, params.id)
    if (!canApprove) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = approveLeaveRequestSchema.parse(body)

    const updateData = {
      status: validatedData.status,
      approved_by: session.user.id,
      approved_at: validatedData.status === "APPROVED" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }

    const { data: updatedLeaveRequest, error } = await supabase
      .from('leave_requests')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error || !updatedLeaveRequest) {
      return NextResponse.json({ error: "Leave request not found" }, { status: 404 })
    }

    return NextResponse.json(updatedLeaveRequest)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error approving leave request:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
