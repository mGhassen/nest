import { NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from 'next/headers'
// import { getUserWithRole, can } from "@/lib/rbac"
import type { Database } from "@/types/database.types"

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // const user = await getUserWithRole(session.user.id)
    // if (!user) {
    //   return NextResponse.json({ error: "User not found" }, { status: 404 })
    // }

    // // Check permissions
    // if (!can(user.role, "read", "audit")) {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    // }

    const { searchParams } = new URL(request.url)
    const entityType = searchParams.get("entityType")
    const entityId = searchParams.get("entityId")
    const actorId = searchParams.get("actorId")
    const action = searchParams.get("action")
    const limit = parseInt(searchParams.get("limit") || "100")
    const offset = parseInt(searchParams.get("offset") || "0")

    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filter by entity type if provided
    if (entityType) {
      query = query.eq('entity_type', entityType)
    }

    // Filter by entity ID if provided
    if (entityId) {
      query = query.eq('entity_id', entityId)
    }

    // Filter by actor if provided
    if (actorId) {
      query = query.eq('actor_id', actorId)
    }

    // Filter by action if provided
    if (action) {
      query = query.eq('action', action)
    }

    const { data: auditLogsList, error } = await query

    if (error) {
      console.error("Error fetching audit logs:", error)
      return NextResponse.json(
        { error: "Failed to fetch audit logs" },
        { status: 500 }
      )
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })

    // Apply the same filters for count
    if (entityType) {
      countQuery = countQuery.eq('entity_type', entityType)
    }
    if (entityId) {
      countQuery = countQuery.eq('entity_id', entityId)
    }
    if (actorId) {
      countQuery = countQuery.eq('actor_id', actorId)
    }
    if (action) {
      countQuery = countQuery.eq('action', action)
    }

    const { count: totalCount, error: countError } = await countQuery

    if (countError) {
      console.error("Error counting audit logs:", countError)
      return NextResponse.json(
        { error: "Failed to get audit log count" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: auditLogsList || [],
      pagination: {
        total: totalCount || 0,
        limit,
        offset,
        hasMore: (offset + limit) < (totalCount || 0),
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
