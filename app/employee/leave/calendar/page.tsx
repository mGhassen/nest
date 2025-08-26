"use client"

import { useAuth } from "@/lib/auth/auth-context"
import { useEffect } from "react"
import { redirect } from "next/navigation"
import MainLayout from "@/components/layout/main-layout"

export default function LeaveCalendarPage() {
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      redirect("/auth/signin")
    }
  }, [user, isLoading])

  if (isLoading || !user) {
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
          <h2 className="text-3xl font-bold tracking-tight">Leave Calendar</h2>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-4">
            <div className="rounded-xl border bg-card text-card-foreground shadow">
              <div className="p-6">
                <h3 className="text-lg font-semibold">Team Leave Calendar</h3>
                <p className="text-muted-foreground mt-2">
                  View approved and pending leave requests for your team.
                </p>
                {/* TODO: Add calendar component */}
                <div className="mt-4 p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Leave calendar component will be implemented here.
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
