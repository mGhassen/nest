"use client"

import { useAuth } from "@/hooks/use-auth"
import { useEffect } from "react"
import { redirect } from "next/navigation"

export default function HomePage() {
  const { user, isLoading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      redirect("/auth/login")
      return
    }

    if (user && !isLoading) {
      // Redirect based on role
      if (user.isAdmin) {
        redirect("/admin/dashboard")
      } else {
        redirect("/employee/dashboard")
      }
    }
  }, [user, isLoading, isAuthenticated])

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
