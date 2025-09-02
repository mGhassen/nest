"use client"

import { useAuth } from "@/hooks/use-auth"
import { useEffect } from "react"
import { redirect } from "next/navigation"
import MainLayout from "@/components/layout/main-layout"
import StatsCards from "@/components/dashboard/stats-cards"
import TeamOverview from "@/components/dashboard/team-overview"
import RecentActivity from "@/components/dashboard/recent-activity"
import PendingActions from "@/components/dashboard/pending-actions"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function SharedDashboardPage() {
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      redirect("/auth/login")
      return
    }

    if (user && !isLoading) {
      // Redirect based on role
      if (user.isAdmin) {
        redirect("/admin/dashboard")
      } else {
        redirect("/employee/dashboard")
      }
    }
  }, [user, isLoading])

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
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
          <LoadingSpinner text="Redirecting..." />
        </div>
      </div>
    </MainLayout>
  )
}
