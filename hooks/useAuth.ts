import { useSession } from "better-auth/react"
import { getUserWithRole } from "@/lib/rbac"
import { useEffect, useState } from "react"

export function useAuth() {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      getUserWithRole(session.user.id).then((userWithRole) => {
        setUser(userWithRole)
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [session])

  return {
    user,
    session,
    status,
    loading,
    isAuthenticated: !!session,
  }
}
