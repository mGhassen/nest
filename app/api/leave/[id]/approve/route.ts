import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "better-auth"
import { authConfig } from "@/lib/auth"
import { db } from "@/lib/db"
import { leaveRequests } from "@/lib/db/schema"
import { canApproveLeave } from "@/lib/rbac"
import { eq } from "drizzle-orm"
import { z } from "zod"

const approveLeaveRequestSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  notes: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig)
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

    const updatedLeaveRequest = await db
      .update(leaveRequests)
      .set({
        status: validatedData.status,
        approverId: session.user.id,
        approvedAt: validatedData.status === "APPROVED" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(leaveRequests.id, params.id))
      .returning()

    if (!updatedLeaveRequest[0]) {
      return NextResponse.json({ error: "Leave request not found" }, { status: 404 })
    }

    return NextResponse.json(updatedLeaveRequest[0])
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
