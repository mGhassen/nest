"use client"

import { useSession } from "better-auth/react"
import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import MainLayout from "@/components/layout/main-layout"
import { getUserWithRole } from "@/lib/rbac"
import StatsCards from "@/components/dashboard/stats-cards"
import TeamOverview from "@/components/dashboard/team-overview"
import RecentActivity from "@/components/dashboard/recent-activity"
import PendingActions from "@/components/dashboard/pending-actions"

export default function AdminDashboardPage() {
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

  // Redirect non-admins to appropriate portal
  if (userRole && !["OWNER", "ADMIN", "HR"].includes(userRole)) {
    if (userRole === "MANAGER") {
      redirect("/manager/dashboard")
    } else if (userRole === "EMPLOYEE") {
      redirect("/employee/dashboard")
    } else {
      redirect("/shared/dashboard")
    }
  }

  return (
    <MainLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-4">
            <div className="rounded-xl border bg-card text-card-foreground shadow">
              <div className="p-6">
                <h3 className="text-lg font-semibold">System Administration</h3>
                <p className="text-muted-foreground mt-2">
                  Manage employees, payroll, company settings, and system configuration.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <StatsCards />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <TeamOverview />
          <RecentActivity />
        </div>
        <PendingActions />
      </div>
    </MainLayout>
  )
}
