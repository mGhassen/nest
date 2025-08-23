"use client"

import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import { redirect } from "next/navigation"

export default function HomePage() {
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  // Redirect based on role
  if (userRole) {
    if (["OWNER", "ADMIN", "HR"].includes(userRole)) {
      redirect("/admin/dashboard")
    } else if (["MANAGER", "EMPLOYEE"].includes(userRole)) {
      redirect("/employee/dashboard")
    }
  }

  // Fallback to router dashboard
  redirect("/router/dashboard")
}
