import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "better-auth"
import { authConfig } from "@/lib/auth"
import { db } from "@/lib/db"
import { timesheets } from "@/lib/db/schema"
import { canApproveTimesheet } from "@/lib/rbac"
import { eq } from "drizzle-orm"
import { z } from "zod"

const approveTimesheetSchema = z.object({
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

    // Check if user can approve this timesheet
    const canApprove = await canApproveTimesheet(session.user.id, params.id)
    if (!canApprove) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = approveTimesheetSchema.parse(body)

    const updatedTimesheet = await db
      .update(timesheets)
      .set({
        status: validatedData.status,
        approvedAt: validatedData.status === "APPROVED" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(timesheets.id, params.id))
      .returning()

    if (!updatedTimesheet[0]) {
      return NextResponse.json({ error: "Timesheet not found" }, { status: 404 })
    }

    return NextResponse.json(updatedTimesheet[0])
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
