"use client"

import { useAuth } from "@/hooks/use-auth"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
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
  const router = useRouter()

  useEffect(() => {
    // Only redirect if we're sure the user is not authenticated
    if (!isLoading && !isAuthenticated) {
      console.log('ProtectedRoute: User not authenticated, redirecting to login');
      router.push("/auth/login")
      return
    }

    if (user && !isLoading) {
      // Check admin requirements
      if (requireAdmin && !user.isAdmin) {
        console.log('ProtectedRoute: Admin required but user is not admin');
        router.push("/unauthorized")
        return
      }

      // Check employee requirements
      if (requireEmployee && user.isAdmin) {
        console.log('ProtectedRoute: Employee required but user is admin');
        router.push("/admin/dashboard")
        return
      }
    }
  }, [user, isLoading, isAuthenticated, requireAdmin, requireEmployee, router])

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
