"use client"

import { useAuth } from "@/lib/auth/auth-context"
import { useEffect, useState } from "react"
import { redirect } from "next/navigation"

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      redirect("/auth/signin")
      return
    }

    if (user) {
      setUserRole(user.role)
    }
  }, [user, isLoading])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  // Redirect based on role
  if (userRole) {
    if (["OWNER", "HR", "MANAGER"].includes(userRole)) {
      redirect("/admin/dashboard")
    } else if (["EMPLOYEE"].includes(userRole)) {
      redirect("/employee/dashboard")
    }
  }

  // Fallback to employee dashboard
  redirect("/employee/dashboard")
}
