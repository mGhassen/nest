"use client"

import { useSupabaseAuth } from "@/hooks/useSupabaseAuth"
import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import MainLayout from "@/components/layout/main-layout"
import { getUserWithRole } from "@/lib/rbac"

export default function WeeklyTimesheetPage() {
  const { data: session, status } = useSession()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      getUserWithRole(session.user.id).then((user) => {
        if (user) {
          setUserRole(user.role)
        }
        setLoading(false)
      })
    } else if (status === "unauthenticated") {
      redirect("/auth/signin")
    }
  }, [session, status])

  if (loading) {
    return (
      <MainLayout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading...</div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Weekly Timesheet</h2>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-4">
            <div className="rounded-xl border bg-card text-card-foreground shadow">
              <div className="p-6">
                <h3 className="text-lg font-semibold">Weekly Time Entry</h3>
                <p className="text-muted-foreground mt-2">
                  Enter your hours for the current week.
                </p>
                {/* TODO: Add weekly timesheet component */}
                <div className="mt-4 p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Weekly timesheet component will be implemented here.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
