"use client"

import { useSupabaseAuth } from "@/hooks/useSupabaseAuth"
import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import MainLayout from "@/components/layout/main-layout"
import EmployeeForm from "@/components/employees/employee-form"
import { getUserWithRole } from "@/lib/rbac"

export default function CreateEmployeePage() {
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
          <h2 className="text-3xl font-bold tracking-tight">Create Employee</h2>
        </div>
        <EmployeeForm />
      </div>
    </MainLayout>
  )
}
