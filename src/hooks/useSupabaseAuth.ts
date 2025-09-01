import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'

type UserRole = 'admin' | 'employee' | undefined

interface AppUser extends Omit<SupabaseUser, 'role'> {
  role?: UserRole
}

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<UserRole>(undefined)
  const supabase = createClientComponentClient()
  const router = useRouter()

  // Fetch user role from the database
  const fetchUserRole = async (userId: string): Promise<UserRole> => {
    try {
      // First try to get role from accounts table
      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .select('role')
        .eq('auth_user_id', userId)
        .single()

      if (!accountError && accountData?.role) {
        // Map account roles to user roles
        if (accountData.role === 'OWNER' || accountData.role === 'HR') {
          return 'admin'
        } else if (accountData.role === 'MANAGER' || accountData.role === 'EMPLOYEE') {
          return 'employee'
        }
      }

      // Fallback to employees table if account lookup fails
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('role')
        .eq('user_id', userId)
        .single()

      if (employeeError || !employeeData?.role) return undefined
      return employeeData.role === 'admin' ? 'admin' : 'employee'
    } catch (error) {
      console.error('Error fetching user role:', error)
      return undefined
    }
  }

  // Handle auth state changes
  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        
        if (session?.user) {
          const userRole = await fetchUserRole(session.user.id)
          setUser({ ...session.user, role: userRole })
          setRole(userRole || undefined)
        } else {
          setUser(null)
          setRole(undefined)
        }
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        setSession(session)
        
        if (session?.user) {
          const userRole = await fetchUserRole(session.user.id)
          setUser({ ...session.user, role: userRole })
          setRole(userRole)
        } else {
          setUser(null)
          setRole(undefined)
        }
        
        setLoading(false)
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [supabase])

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      
      // Fetch user role after successful sign in
      if (data.user) {
        const userRole = await fetchUserRole(data.user.id)
        setUser({ ...data.user, role: userRole })
        setRole(userRole)
        
        // Redirect based on role
        let redirectPath = '/employee/dashboard' // default fallback
        
        if (userRole === 'admin') {
          // Check if user is OWNER or HR to determine admin dashboard
          const { data: accountData } = await supabase
            .from('accounts')
            .select('role')
            .eq('auth_user_id', data.user.id)
            .single()
          
          if (accountData?.role === 'OWNER') {
            redirectPath = '/admin/dashboard'
          } else if (accountData?.role === 'HR') {
            redirectPath = '/admin/dashboard'
          } else if (accountData?.role === 'MANAGER') {
            redirectPath = '/admin/dashboard'
          } else {
            redirectPath = '/employee/dashboard'
          }
        }
        
        router.push(redirectPath)
        router.refresh()
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw error
    return { data, error }
  }

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    router.push('/auth/signin')
    router.refresh()
    return { error }
  }

  // Get session
  const getSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  }

  // Get current user
  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
      
      // The actual redirection will be handled by the auth state change listener
      return { data, error: null }
    } catch (error) {
      console.error('Google sign in error:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  // Verify OTP for email verification and password reset
  const verifyOtp = async ({ token, type }: { token: string; type: string }) => {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type as any,
    })
    return { data, error }
  }

  // Reset password
  const resetPassword = async ({
    email,
    token,
    newPassword,
  }: {
    email?: string
    token?: string
    newPassword?: string
  }) => {
    if (token && newPassword) {
      // Complete password reset
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      })
      return { data, error }
    } else if (email) {
      // Request password reset
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      return { data, error }
    }
    return { data: null, error: { message: 'Invalid parameters' } }
  }

  return {
    user,
    session,
    role,
    loading,
    isAuthenticated: !!user,
    isAdmin: role === 'admin',
    isEmployee: role === 'employee',
    // Auth methods
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    verifyOtp,
    resetPassword,
    // Utility methods
    getSession,
    getCurrentUser: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const userRole = await fetchUserRole(user.id)
        return { ...user, role: userRole }
      }
      return null
    },
  }
}
