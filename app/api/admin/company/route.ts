import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "better-auth"
import { authConfig } from "@/lib/auth"
import { db } from "@/lib/db"
import { companies, locations, costCenters, workSchedules } from "@/lib/db/schema"
import { getUserWithRole, can } from "@/lib/rbac"
import { eq } from "drizzle-orm"
import { z } from "zod"

const updateCompanySchema = z.object({
  name: z.string().min(1).optional(),
  countryCode: z.string().length(2).optional(),
  currency: z.string().length(3).optional(),
})

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
    if (!can(user.role, "read", "company")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const company = await db.query.companies.findFirst({
      where: eq(companies.id, user.companyId),
      with: {
        locations: true,
        costCenters: true,
        workSchedules: true,
      },
    })

    if (!company) {
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
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserWithRole(session.user.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check permissions
    if (!can(user.role, "write", "company")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateCompanySchema.parse(body)

    const updatedCompany = await db
      .update(companies)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(companies.id, user.companyId))
      .returning()

    if (!updatedCompany[0]) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    return NextResponse.json(updatedCompany[0])
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
