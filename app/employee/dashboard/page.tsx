"use client"

import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import MainLayout from "@/components/layout/main-layout"
import { getUserWithRole } from "@/lib/rbac"

export default function EmployeePortalPage() {
  const { user, loading } = useAuth()
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      redirect("/auth/signin")
      return
    }

    if (user) {
      setUserRole(user.role)
    }
  }, [user, loading])

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

  // Redirect non-employees/managers to appropriate portal
  if (userRole && !["EMPLOYEE", "MANAGER"].includes(userRole)) {
    if (["OWNER", "ADMIN", "HR"].includes(userRole)) {
      redirect("/admin/dashboard")
    } else {
      redirect("/shared/dashboard")
    }
  }

  return (
    <MainLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            {userRole === "MANAGER" ? "Manager Portal" : "Employee Portal"}
          </h2>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-4">
            <div className="rounded-xl border bg-card text-card-foreground shadow">
              <div className="p-6">
                <h3 className="text-lg font-semibold">
                  {userRole === "MANAGER" 
                    ? "Welcome to Your Manager Portal" 
                    : "Welcome to Your Employee Portal"
                  }
                </h3>
                <p className="text-muted-foreground mt-2">
                  {userRole === "MANAGER"
                    ? "Manage your team's timesheets, leave requests, and performance."
                    : "Access your timesheets, leave requests, and personal information."
                  }
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
