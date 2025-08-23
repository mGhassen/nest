"use client"

import { useSession } from "better-auth/react"
import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { getUserWithRole } from "@/lib/rbac"

export default function HomePage() {
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
