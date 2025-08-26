import { supabase } from './supabase'
import type { Database, UserRole } from '@/types/database.types'

type Account = Database['public']['Tables']['accounts']['Row']
export type Action = 'read' | 'write' | 'delete' | 'approve' | 'admin'
export type Entity = 'employee' | 'timesheet' | 'leave' | 'payroll' | 'company' | 'settings' | 'audit'

export interface UserWithRole {
  id: string
  email: string
  role: UserRole
  username: string | null
  full_name: string | null
  avatar_url: string | null
  website: string | null
  company_id: string | null
  created_at?: string | null
  updated_at?: string | null
}

// Permission matrix
const permissions: Record<UserRole, Record<Entity, Action[]>> = {
  OWNER: {
    employee: ["read", "write", "delete", "approve", "admin"],
    timesheet: ["read", "write", "delete", "approve", "admin"],
    leave: ["read", "write", "delete", "approve", "admin"],
    payroll: ["read", "write", "delete", "approve", "admin"],
    company: ["read", "write", "delete", "approve", "admin"],
    settings: ["read", "write", "delete", "approve", "admin"],
    audit: ["read", "write", "delete", "admin"],
  },
  HR: {
    employee: ["read", "write", "delete", "approve", "admin"],
    timesheet: ["read", "write", "delete", "approve", "admin"],
    leave: ["read", "write", "delete", "approve", "admin"],
    payroll: ["read", "write", "delete", "approve", "admin"],
    company: ["read", "write", "delete", "approve", "admin"],
    settings: ["read", "write", "delete", "approve", "admin"],
    audit: ["read", "write", "delete", "admin"],
  },
  MANAGER: {
    employee: ["read", "approve"],
    timesheet: ["read", "approve"],
    leave: ["read", "approve"],
    payroll: ["read"],
    company: ["read"],
    settings: ["read"],
    audit: ["read"],
  },
  EMPLOYEE: {
    employee: ["read"],
    timesheet: ["read", "write"],
    leave: ["read", "write"],
    payroll: ["read"],
    company: ["read"],
    settings: ["read"],
    audit: [],
  },
}

export async function getUserWithRole(userId: string): Promise<UserWithRole | null> {
  try {
    const supabaseClient = supabase()
    
    // First get the user's account info
    const { data: profile, error: profileError } = await supabaseClient
      .from('accounts')
      .select('*')
      .eq('auth_user_id', userId)
      .single()

    if (profileError || !profile) {
      console.error('Error getting user profile:', profileError)
      return null
    }

    // Then get the user's company membership using the account ID
    const { data: membership, error: membershipError } = await supabaseClient
      .from('memberships')
      .select('company_id, role')
      .eq('user_id', profile.id)
      .single()

    if (membershipError) {
      console.error('Error getting user membership:', membershipError)
      // If no membership found, still return user but with null company_id
    }

    // Create a properly typed user object
    const userWithRole: UserWithRole = {
      id: (profile as any).id,
      email: (profile as any).email || '',
      role: (membership?.role as UserRole) || ((profile as any).role as UserRole) || 'EMPLOYEE',
      username: (profile as any).username || null,
      full_name: (profile as any).full_name || null,
      avatar_url: (profile as any).profile_image_url || null,
      website: (profile as any).website || null,
      company_id: membership?.company_id || null,
      updated_at: (profile as any).updated_at || null
    }
    
    return userWithRole
  } catch (error) {
    console.error('Error getting user with role:', error)
    return null
  }
}

export function can(role: UserRole, action: Action, entity: Entity): boolean {
  // For now, allow all OWNER and HR actions
  if (role === 'OWNER' || role === 'HR') return true
  
  // Basic permission check for other roles
  const rolePermissions = permissions[role]
  if (!rolePermissions) return false
  
  const entityPermissions = rolePermissions[entity]
  return entityPermissions?.includes(action) || false
}

export async function canAccessEmployee(userId: string, targetEmployeeId: string): Promise<boolean> {
  try {
    // If user is trying to access their own record, allow
    if (userId === targetEmployeeId) return true

    const user = await getUserWithRole(userId)
    if (!user) return false

    // Admins can access any employee
    if (user.role === 'OWNER' || user.role === 'HR') return true

    // For now, allow managers to access any employee
    // In a real app, you'd check the reporting structure here
    if (user.role === 'MANAGER') return true

    return false
  } catch (error) {
    console.error('Error checking employee access:', error)
    return false
  }
}

export async function canApproveTimesheet(userId: string, timesheetId: string): Promise<boolean> {
  const user = await getUserWithRole(userId)
  if (!user) return false

  // Admins can approve all timesheets
  if (user.role === 'OWNER' || user.role === 'HR') {
    return true
  }

  // Managers can approve their team's timesheets
  if (user.role === 'MANAGER') {
    // In a real app, you'd check if the timesheet belongs to a team member
    // For now, we'll just allow all approvals
    return true
  }

  return false
}

export async function canApproveLeave(userId: string, leaveRequestId: string): Promise<boolean> {
  const user = await getUserWithRole(userId)
  if (!user) return false

  // Admins can approve all leave requests
  if (user.role === 'OWNER' || user.role === 'HR') {
    return true
  }

  // Managers can approve their team's leave requests
  if (user.role === 'MANAGER') {
    // In a real app, you'd check if the leave request belongs to a team member
    // For now, we'll just allow all approvals
    return true
  }

  return false
}
