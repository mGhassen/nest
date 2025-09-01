// Simplified authentication system - only admin and employee roles
export type SimpleRole = 'admin' | 'employee';

export interface SimpleUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: SimpleRole;
  isAdmin: boolean;
  status?: string;
}

// Simple permission check
export function canAccess(user: SimpleUser | null, resource: string): boolean {
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

// Check if user can perform action
export function canPerform(user: SimpleUser | null, action: string, resource: string): boolean {
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

// Route protection helper
export function getRedirectPath(user: SimpleUser | null): string {
  if (!user) return '/auth/login';
  
  if (user.isAdmin) {
    return '/admin/dashboard';
  } else {
    return '/employee/dashboard';
  }
}
