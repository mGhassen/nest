"use client"

import { useAuth } from "@/hooks/use-auth"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ReactNode } from "react"

interface AuthGuardProps {
  children: ReactNode
  requireAdmin?: boolean
}

export default function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login")
      return
    }

    if (user && !isLoading) {
      if (requireAdmin && !user.isAdmin) {
        router.push("/unauthorized")
        return
      }
    }
  }, [user, isLoading, isAuthenticated, requireAdmin, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  if (requireAdmin && !user.isAdmin) {
    return null
  }

  return <>{children}</>
}
