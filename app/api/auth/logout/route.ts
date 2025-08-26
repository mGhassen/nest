import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    console.log('Server-side logout initiated');
    
    // Create Supabase client to handle server-side logout
    const supabase = createRouteHandlerClient({ cookies });
    
    // Sign out from Supabase (this will clear the session)
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Supabase signOut error:', error);
    }
    
    console.log('Server-side logout completed');
    
    return NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Failed to logout" },
      { status: 500 }
    );
  }
} 