"use client";

import { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  authError: string | null
  isLoggingIn: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  
  const supabase = createClientComponentClient()
  const router = useRouter()

  // Check initial session
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user || null)
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [supabase.auth])

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', event, session?.user?.email)
      
      if (event === 'SIGNED_IN' && session) {
        setUser(session.user)
        setAuthError(null)
        // Redirect to dashboard
        router.push('/admin/dashboard')
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        router.push('/auth/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth, router])

  const login = async (email: string, password: string) => {
    setIsLoggingIn(true)
    setAuthError(null)
    
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      
      if (error) {
        setAuthError(error.message)
        return
      }
      
      console.log('✅ Login successful')
      // Auth state change will handle redirect
      
    } catch (error) {
      console.error('💥 Login error:', error)
      setAuthError('An unexpected error occurred')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      // Auth state change will handle redirect
    } catch (error) {
      console.error('💥 Logout error:', error)
      router.push('/auth/login')
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    authError,
    isLoggingIn,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
