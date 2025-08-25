"use client"

import { useEffect } from "react"
import { redirect } from "next/navigation"
import { useAuth } from "@/hooks/useSupabaseAuth"
import MainLayout from "@/components/layout/main-layout"

export default function EmployeeDashboardPage() {
  const { user, loading, isAdmin } = useAuth()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      redirect("/auth/signin")
    }
    
    // Redirect admins to admin dashboard
    if (!loading && isAdmin) {
      redirect("/admin/dashboard")
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

  // Redirect non-employees to unauthorized
  if (user.role !== 'employee') {
    redirect("/unauthorized")
  }

  return (
    <MainLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome back, {user.email?.split('@')[0] || 'Employee'}!
          </h2>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-4">
            <div className="rounded-xl border bg-card text-card-foreground shadow">
              <div className="p-6">
                <h3 className="text-lg font-semibold">
                  Welcome to Your Employee Portal
                </h3>
                <p className="text-muted-foreground mt-2">
                  Access your timesheets, leave requests, and personal information.
                </p>
              </div>
            </div>
          </div>
          
          <div className="col-span-2">
            <div className="rounded-xl border bg-card text-card-foreground shadow">
              <div className="p-6">
                <h3 className="text-lg font-semibold">My Timesheets</h3>
                <p className="text-muted-foreground mt-2">
                  View and submit your weekly timesheets.
                </p>
                <div className="mt-4">
                  <a 
                    href="/employee/timesheets" 
                    className="text-primary hover:underline"
                  >
                    Go to Timesheets →
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-span-2">
            <div className="rounded-xl border bg-card text-card-foreground shadow">
              <div className="p-6">
                <h3 className="text-lg font-semibold">Leave Requests</h3>
                <p className="text-muted-foreground mt-2">
                  Request time off and view your leave balance.
                </p>
                <div className="mt-4">
                  <a 
                    href="/employee/leave" 
                    className="text-primary hover:underline"
                  >
                    Request Leave →
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-span-4">
            <div className="rounded-xl border bg-card text-card-foreground shadow">
              <div className="p-6">
                <h3 className="text-lg font-semibold">My Profile</h3>
                <p className="text-muted-foreground mt-2">
                  View and update your personal information and documents.
                </p>
                <div className="mt-4">
                  <a 
                    href="/employee/documents" 
                    className="text-primary hover:underline"
                  >
                    View Documents →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
