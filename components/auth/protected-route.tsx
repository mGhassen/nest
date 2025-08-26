"use client"

import { useAuth } from "@/hooks/use-auth"
import { useEffect } from "react"
import { redirect } from "next/navigation"
import { ReactNode } from "react"

interface ProtectedRouteProps {
  children: ReactNode
  requireAdmin?: boolean
  requireEmployee?: boolean
}

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false, 
  requireEmployee = false 
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      redirect("/auth/login")
      return
    }

    if (user && !isLoading) {
      // Check admin requirements
      if (requireAdmin && !user.isAdmin) {
        redirect("/unauthorized")
        return
      }

      // Check employee requirements
      if (requireEmployee && user.isAdmin) {
        redirect("/admin/dashboard")
        return
      }
    }
  }, [user, isLoading, isAuthenticated, requireAdmin, requireEmployee])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading authentication...</div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null // Will redirect
  }

  // Check final permissions
  if (requireAdmin && !user.isAdmin) {
    return null // Will redirect
  }

  if (requireEmployee && user.isAdmin) {
    return null // Will redirect
  }

  return <>{children}</>
}
