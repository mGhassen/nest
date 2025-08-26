"use client"

import { useAuth } from "@/lib/auth/auth-context"
import { useEffect } from "react"
import { redirect } from "next/navigation"
import MainLayout from "@/components/layout/main-layout"
import StatsCards from "@/components/dashboard/stats-cards"
import TeamOverview from "@/components/dashboard/team-overview"
import RecentActivity from "@/components/dashboard/recent-activity"
import PendingActions from "@/components/dashboard/pending-actions"

export default function SharedDashboardPage() {
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      redirect("/auth/signin")
      return
    }

    if (user && !isLoading) {
      // Redirect based on role
      if (["OWNER", "HR", "MANAGER"].includes(user.role)) {
        redirect("/admin/dashboard")
      } else if (["EMPLOYEE"].includes(user.role)) {
        redirect("/employee/dashboard")
      }
    }
  }, [user, isLoading])

  if (isLoading) {
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

    // Show loading while redirecting
  return (
    <MainLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Redirecting...</div>
        </div>
      </div>
    </MainLayout>
  )
}
