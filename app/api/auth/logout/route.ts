import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseServer()
    
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }
    
    const token = authHeader.replace('Bearer ', '')
    
    // Sign out the user
    await supabase.auth.signOut()
    
    return NextResponse.json({ message: "Logged out successfully" }, { status: 200 })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
} 