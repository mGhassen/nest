"use client"

import { useAuth } from "@/hooks/use-auth"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        console.log('🚫 Not authenticated, redirecting to login');
        router.push("/auth/login")
        return
      }

      if (user) {
        console.log('✅ Authenticated, redirecting to dashboard');
        // Redirect based on role
        if (user.isAdmin) {
          router.push("/admin/dashboard")
        } else {
          router.push("/employee/dashboard")
        }
      }
    }
  }, [user, isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  // Show loading while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Redirecting...</div>
    </div>
  )
}
