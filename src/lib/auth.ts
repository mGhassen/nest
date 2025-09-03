import { supabaseServer } from './supabase';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export type UserRole = 'ADMIN' | 'EMPLOYEE';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  isAdmin: boolean;
  status?: string;
  companyId?: string;
  companies?: Array<{
    company_id: string;
    company_name: string;
    role: UserRole;
  }>;
  currentCompany?: {
    company_id: string;
    company_name: string;
    role: UserRole;
  };
}

// ============================================================================
// ROLE AND PERMISSION FUNCTIONS
// ============================================================================

/**
 * Get the current user's role in their current company
 * This replaces the deprecated accounts.role field
 */
export async function getCurrentUserRole(accountId: string): Promise<UserRole | null> {
  try {
    const supabase = supabaseServer();
    
    // Get current company info for the user
    const { data: currentCompany, error } = await supabase
      .rpc('get_current_company_info', { p_account_id: accountId });
    
    if (error || !currentCompany || currentCompany.length === 0) {
      console.error('Error fetching current company role:', error);
      return null;
    }
    
    return currentCompany[0].role;
  } catch (error) {
    console.error('Error in getCurrentUserRole:', error);
    return null;
  }
}

/**
 * Check if the current user is an admin in their current company
 */
export async function isCurrentUserAdmin(accountId: string): Promise<boolean> {
  const role = await getCurrentUserRole(accountId);
  return role === 'ADMIN';
}

/**
 * Check if a user is a superuser
 */
export async function isCurrentUserSuperuser(accountId: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseServer()
      .rpc('is_superuser', { p_account_id: accountId });
    
    if (error) {
      console.error('Error checking superuser status:', error);
      return false;
    }
    
    return data === true;
  } catch (error) {
    console.error('Error in isCurrentUserSuperuser:', error);
    return false;
  }
}

/**
 * Get an employee's role in a specific company
 */
export async function getEmployeeRoleInCompany(accountId: string, companyId: string): Promise<UserRole | null> {
  try {
    const supabase = supabaseServer();
    
    const { data: roleData, error } = await supabase
      .from('account_company_roles')
      .select('role')
      .eq('account_id', accountId)
      .eq('company_id', companyId)
      .single();
    
    if (error || !roleData) {
      return null;
    }
    
    return roleData.role;
  } catch (error) {
    console.error('Error in getEmployeeRoleInCompany:', error);
    return null;
  }
}

// ============================================================================
// PERMISSION CHECKS
// ============================================================================

/**
 * Check if user can access a resource
 */
export function canAccess(user: User | null, resource: string): boolean {
  if (!user) return false;
  
  // Admin can access everything
  if (user.isAdmin) return true;
  
  // Employee permissions
  switch (resource) {
    case 'dashboard':
    case 'timesheets':
    case 'leave':
    case 'profile':
      return true; // All users can access these
    case 'employees':
    case 'payroll':
    case 'settings':
    case 'admin':
      return user.isAdmin; // Only admins
    default:
      return false;
  }
}

/**
 * Check if user can perform an action on a resource
 */
export function canPerform(user: User | null, action: string, resource: string): boolean {
  if (!user) return false;
  
  // Admin can do everything
  if (user.isAdmin) return true;
  
  // Employee permissions
  switch (action) {
    case 'read':
      return canAccess(user, resource);
    case 'write':
    case 'create':
    case 'update':
      // Employees can only write to their own data
      return ['timesheets', 'leave', 'profile'].includes(resource);
    case 'delete':
    case 'approve':
      return false; // Only admins can delete/approve
    default:
      return false;
  }
}

/**
 * Get redirect path based on user role
 */
export function getRedirectPath(user: User | null): string {
  if (!user) return '/auth/login';
  
  if (user.isAdmin) {
    return '/admin/dashboard';
  } else {
    return '/employee/dashboard';
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.charAt(0) || '';
  const last = lastName?.charAt(0) || '';
  return (first + last).toUpperCase() || '?';
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}

export function formatDate(date: string | undefined | Date): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function formatDateTime(date: string | undefined | Date): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const dateStr = d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const timeStr = d.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
  return `${dateStr} ${timeStr}`;
}

export function getDayName(dayOfWeek: number): string {
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  return days[dayOfWeek] || '';
}

export function formatTime(time: string | undefined): string {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes}`;
}

export function isUnauthorizedError(error: Error): boolean {
  return error.message.includes('Unauthorized') || 
         error.message.includes('401') ||
         error.message.includes('unauthorized');
}
