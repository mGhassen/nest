import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import type { Database } from '@/types/database.types'
import { getUserWithRole } from '@/lib/rbac'

const updateCompanySchema = z.object({
  name: z.string().min(1).optional(),
  countryCode: z.string().length(2).optional(),
  currency: z.string().length(3).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if user is admin
    const { data: profile } = await supabase
      .from('accounts')
      .select('role')
      .eq('id', session.user.id)
      .single()
      
    if (profile?.role !== 'OWNER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get the company for the current user (assuming user ID is the company ID for now)
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select(`
        *,
        locations(*),
        cost_centers(*),
        work_schedules(*)
      `)
      .eq('id', session.user.id)
      .single()

    if (companyError) {
      console.error("Error fetching company:", companyError)
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error("Error fetching company:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if user is admin
    const { data: profile } = await supabase
      .from('accounts')
      .select('role')
      .eq('id', session.user.id)
      .single()
      
    if (profile?.role !== 'OWNER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const user = await getUserWithRole(session.user.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user is admin
    if (user.role !== 'OWNER') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateCompanySchema.parse(body)

    // Update the company using the user's ID as the company ID for now
    const { data: updatedCompany, error: updateError } = await supabase
      .from('companies')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.user.id)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating company:", updateError)
      return NextResponse.json({ error: "Failed to update company" }, { status: 500 })
    }

    if (!updatedCompany) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    return NextResponse.json(updatedCompany)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating company:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
