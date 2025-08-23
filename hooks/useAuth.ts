import { useAuth as useAuthContext } from "@/lib/auth-context"

export function useAuth() {
  const auth = useAuthContext()
  
  return {
    user: auth.user,
    session: { user: auth.user },
    status: auth.loading ? "loading" : (auth.isAuthenticated ? "authenticated" : "unauthenticated"),
    loading: auth.loading,
    isAuthenticated: auth.isAuthenticated,
  }
}
