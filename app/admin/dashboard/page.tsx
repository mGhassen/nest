"use client"

import { useEffect } from "react"
import { redirect } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import AdminLayout from "@/components/layout/admin-layout"
import { Button } from "@/components/ui/button"
import { Calendar, Plus } from "lucide-react"
import StatsCards from "@/components/dashboard/stats-cards"
import TeamOverview from "@/components/dashboard/team-overview"
import RecentActivity from "@/components/dashboard/recent-activity"
import PendingActions from "@/components/dashboard/pending-actions"

export default function AdminDashboardPage() {
  const { user, isLoading } = useAuth()

  console.log('AdminDashboard - Auth state:', { user, isLoading });

  // Check if user has admin access
  useEffect(() => {
    console.log('AdminDashboard - useEffect triggered:', { user, isLoading });
    
    // Redirect to unauthorized if not admin
    if (!isLoading && user && !['OWNER', 'HR', 'MANAGER'].includes(user.role)) {
      console.log('AdminDashboard - Redirecting to unauthorized, user role:', user.role);
      redirect("/unauthorized")
    }
  }, [user, isLoading])

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading authentication...</div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!user) {
    console.log('AdminDashboard - No user, redirecting to signin');
    redirect("/auth/signin");
    return null;
  }

  // Redirect non-admins to appropriate portal
  if (!['OWNER', 'HR', 'MANAGER'].includes(user.role)) {
    if (user.role === 'EMPLOYEE') {
      redirect("/employee/dashboard")
    }
    redirect("/unauthorized")
  }

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome back, {user.email?.split('@')[0] || 'Admin'}!
          </h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              View Calendar
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </div>
        </div>
        
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCards />
        </div>
        
        {/* Main Dashboard Content */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4">
            <TeamOverview />
          </div>
          <div className="col-span-3">
            <RecentActivity />
          </div>
        </div>
        
        {/* Pending Actions */}
        <PendingActions />
      </div>
    </AdminLayout>
  )
}
