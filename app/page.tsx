"use client"

import { useAuth } from "@/lib/auth/auth-context"
import { useEffect, useState } from "react"
import { redirect } from "next/navigation"

export default function HomePage() {
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      redirect("/auth/signin")
      return
    }

    if (user && !isLoading) {
      // Redirect based on role
      if (["OWNER", "HR", "MANAGER"].includes(user.role)) {
        redirect("/admin/dashboard")
      } else if (["EMPLOYEE"].includes(user.role)) {
        redirect("/employee/dashboard")
      }
    }
  }, [user, isLoading])

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
