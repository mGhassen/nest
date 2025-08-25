import { NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from 'next/headers'
import { canApproveTimesheet } from "@/lib/rbac"
import { z } from "zod"
import type { Database } from "@/types/database.types"

const approveTimesheetSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  notes: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user can approve this timesheet
    const canApprove = await canApproveTimesheet(session.user.id, params.id)
    if (!canApprove) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = approveTimesheetSchema.parse(body)

    const updateData = {
      status: validatedData.status,
      approved_at: validatedData.status === "APPROVED" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }

    const { data: updatedTimesheet, error } = await supabase
      .from('timesheets')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error || !updatedTimesheet) {
      return NextResponse.json({ error: "Timesheet not found" }, { status: 404 })
    }

    return NextResponse.json(updatedTimesheet)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error approving timesheet:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
