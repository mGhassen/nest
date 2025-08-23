import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { getUserWithRole } from "@/lib/rbac"

type AuthResult = 
  | { user: any; error: null }
  | { user: null; error: string; status: number }

export async function authenticateUser(request: NextRequest): Promise<AuthResult> {
  try {
    // Get auth header
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return { user: null, error: "Unauthorized", status: 401 }
    }

    const token = authHeader.substring(7)
    
    // Verify token with Supabase
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return { user: null, error: "Unauthorized", status: 401 }
    }

    const userWithRole = await getUserWithRole(user.id)
    if (!userWithRole) {
      return { user: null, error: "User not found", status: 404 }
    }

    return { user: userWithRole, error: null }
  } catch (error) {
    console.error("Auth middleware error:", error)
    return { user: null, error: "Internal server error", status: 500 }
  }
}

export async function requireAuth(request: NextRequest): Promise<any | NextResponse> {
  const authResult = await authenticateUser(request)
  if (authResult.error) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }
  return authResult.user
}
