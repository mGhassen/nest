import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "better-auth"
import { authConfig } from "@/lib/auth"
import { db } from "@/lib/db"
import { auditLogs } from "@/lib/db/schema"
import { getUserWithRole, can } from "@/lib/rbac"
import { eq, and, desc } from "drizzle-orm"
import { z } from "zod"
import { sql } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserWithRole(session.user.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check permissions
    if (!can(user.role, "read", "audit")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const entityType = searchParams.get("entityType")
    const entityId = searchParams.get("entityId")
    const actorId = searchParams.get("actorId")
    const action = searchParams.get("action")
    const limit = parseInt(searchParams.get("limit") || "100")
    const offset = parseInt(searchParams.get("offset") || "0")

    let query = db.query.auditLogs.findMany({
      orderBy: [desc(auditLogs.createdAt)],
      limit,
      offset,
    })

    // Filter by entity type if provided
    if (entityType) {
      query = db.query.auditLogs.findMany({
        where: eq(auditLogs.entityType, entityType),
        orderBy: [desc(auditLogs.createdAt)],
        limit,
        offset,
      })
    }

    // Filter by entity ID if provided
    if (entityId) {
      query = db.query.auditLogs.findMany({
        where: eq(auditLogs.entityId, entityId),
        orderBy: [desc(auditLogs.createdAt)],
        limit,
        offset,
      })
    }

    // Filter by actor if provided
    if (actorId) {
      query = db.query.auditLogs.findMany({
        where: eq(auditLogs.actorId, actorId),
        orderBy: [desc(auditLogs.createdAt)],
        limit,
        offset,
      })
    }

    // Filter by action if provided
    if (action) {
      query = db.query.auditLogs.findMany({
        where: eq(auditLogs.action, action),
        orderBy: [desc(auditLogs.createdAt)],
        limit,
        offset,
      })
    }

    const auditLogsList = await query

    // Get total count for pagination
    const totalCount = await db
      .select({ count: sql`count(*)` })
      .from(auditLogs)

    return NextResponse.json({
      data: auditLogsList,
      pagination: {
        total: totalCount[0].count,
        limit,
        offset,
        hasMore: offset + limit < totalCount[0].count,
      },
    })
  } catch (error) {
    console.error("Error fetching audit logs:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
