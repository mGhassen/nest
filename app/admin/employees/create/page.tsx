"use client"

import { useAuth } from "@/lib/auth/auth-context"
import { useEffect } from "react"
import { redirect } from "next/navigation"
import AdminLayout from "@/components/layout/admin-layout"
import EmployeeForm from "@/components/employees/employee-form"

export default function CreateEmployeePage() {
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      redirect("/auth/signin")
    }
    
    // Redirect non-admins to appropriate portal
    if (!isLoading && user && !["OWNER", "HR", "MANAGER"].includes(user.role)) {
      redirect("/employee/dashboard")
    }
  }, [user, isLoading])

  if (isLoading || !user) {
    return (
      <AdminLayout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading...</div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Create Employee</h2>
        </div>
        <EmployeeForm />
      </div>
    </AdminLayout>
  )
}

