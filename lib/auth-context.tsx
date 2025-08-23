"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Role = "OWNER" | "ADMIN" | "HR" | "MANAGER" | "EMPLOYEE"

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: Role
  companyId: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock user data for development
const mockUsers: Record<string, User> = {
  'admin@techcorp.tn': {
    id: 'admin-user-001',
    email: 'admin@techcorp.tn',
    firstName: 'Ahmed',
    lastName: 'Ben Ali',
    role: 'OWNER',
    companyId: 'company-001'
  },
  'hr@techcorp.tn': {
    id: 'hr-user-001',
    email: 'hr@techcorp.tn',
    firstName: 'Fatma',
    lastName: 'Trabelsi',
    role: 'HR',
    companyId: 'company-001'
  },
  'manager@techcorp.tn': {
    id: 'manager-user-001',
    email: 'manager@techcorp.tn',
    firstName: 'Mohamed',
    lastName: 'Karray',
    role: 'MANAGER',
    companyId: 'company-001'
  },
  'employee@techcorp.tn': {
    id: 'employee-user-001',
    email: 'employee@techcorp.tn',
    firstName: 'Sara',
    lastName: 'Mansouri',
    role: 'EMPLOYEE',
    companyId: 'company-001'
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('auth-user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('auth-user')
      }
    }
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    // For development, accept any password for mock users
    const mockUser = mockUsers[email]
    if (mockUser) {
      setUser(mockUser)
      localStorage.setItem('auth-user', JSON.stringify(mockUser))
      return { success: true }
    }
    return { success: false, error: 'Invalid credentials' }
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem('auth-user')
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
