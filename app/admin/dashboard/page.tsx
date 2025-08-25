"use client"

import { useEffect } from "react"
import { redirect } from "next/navigation"
import { useAuth } from "@/hooks/useSupabaseAuth"
import MainLayout from "@/components/layout/main-layout"
import StatsCards from "@/components/dashboard/stats-cards"
import TeamOverview from "@/components/dashboard/team-overview"
import RecentActivity from "@/components/dashboard/recent-activity"
import PendingActions from "@/components/dashboard/pending-actions"

export default function AdminDashboardPage() {
  const { user, loading, isAdmin } = useAuth()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      redirect("/auth/signin")
    }
    
    // Redirect to unauthorized if not admin
    if (!loading && user && !isAdmin) {
      redirect("/unauthorized")
    }
  }, [user, loading, isAdmin])

  if (loading || !user) {
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
  if (!isAdmin) {
    if (user.role === 'employee') {
      redirect("/employee/dashboard")
    }
    redirect("/unauthorized")
  }

  return (
    <MainLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome back, {user.email?.split('@')[0] || 'Admin'}!
          </h2>
        </div>
        <div className="space-y-4">
          <StatsCards />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4">
              <TeamOverview />
            </div>
            <div className="col-span-3">
              <RecentActivity />
            </div>
          </div>
          <PendingActions />
        </div>
      </div>
    </MainLayout>
  )
}
