// Role-based access control utility

export type Role = 'OWNER' | 'ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE';

export interface Permission {
  resource: string;
  action: string;
}

// Permission definitions
const PERMISSIONS: Record<Role, Permission[]> = {
  OWNER: [
    { resource: '*', action: '*' } // Full access
  ],
  ADMIN: [
    { resource: 'employees', action: '*' },
    { resource: 'timesheets', action: '*' },
    { resource: 'leave', action: '*' },
    { resource: 'payroll', action: '*' },
    { resource: 'documents', action: '*' },
    { resource: 'admin', action: '*' },
    { resource: 'settings', action: '*' },
    { resource: 'dashboard', action: 'read' },
    { resource: 'audit', action: 'read' }
  ],
  HR: [
    { resource: 'employees', action: '*' },
    { resource: 'timesheets', action: 'read' },
    { resource: 'leave', action: '*' },
    { resource: 'payroll', action: '*' },
    { resource: 'documents', action: '*' },
    { resource: 'dashboard', action: 'read' },
    { resource: 'settings', action: 'read' }
  ],
  MANAGER: [
    { resource: 'employees', action: 'read' },
    { resource: 'timesheets', action: 'approve' },
    { resource: 'leave', action: 'approve' },
    { resource: 'documents', action: 'read' },
    { resource: 'dashboard', action: 'read' },
    { resource: 'settings', action: 'read' }
  ],
  EMPLOYEE: [
    { resource: 'timesheets', action: 'own' },
    { resource: 'leave', action: 'own' },
    { resource: 'documents', action: 'own' },
    { resource: 'dashboard', action: 'read' },
    { resource: 'settings', action: 'own' }
  ]
};

// Check if a role has permission for a specific resource and action
export function can(role: Role, resource: string, action: string): boolean {
  const rolePermissions = PERMISSIONS[role];
  
  if (!rolePermissions) {
    return false;
  }

  // Check for wildcard permissions (OWNER)
  if (rolePermissions.some(p => p.resource === '*' && p.action === '*')) {
    return true;
  }

  // Check for specific resource and action
  return rolePermissions.some(permission => {
    const resourceMatch = permission.resource === '*' || permission.resource === resource;
    const actionMatch = permission.action === '*' || permission.action === action;
    return resourceMatch && actionMatch;
  });
}

// Check if role can access a specific page/route
export function canAccessRoute(role: Role, route: string): boolean {
  switch (route) {
    case '/':
    case '/dashboard':
      return can(role, 'dashboard', 'read');
    case '/employees':
      return can(role, 'employees', 'read');
    case '/timesheets':
      return can(role, 'timesheets', 'read') || can(role, 'timesheets', 'own');
    case '/leave':
      return can(role, 'leave', 'read') || can(role, 'leave', 'own');
    case '/payroll':
      return can(role, 'payroll', 'read');
    case '/documents':
      return can(role, 'documents', 'read') || can(role, 'documents', 'own');
    case '/admin':
      return can(role, 'admin', 'read');
    case '/settings':
      return can(role, 'settings', 'read') || can(role, 'settings', 'own');
    default:
      return false;
  }
}

// Get display label for role
export function getRoleLabel(role: Role): string {
  switch (role) {
    case 'OWNER':
      return 'Owner';
    case 'ADMIN':
      return 'Administrator';
    case 'HR':
      return 'HR Manager';
    case 'MANAGER':
      return 'Manager';
    case 'EMPLOYEE':
      return 'Employee';
    default:
      return role;
  }
}

// Check if role can perform sensitive actions
export function canPerformSensitiveAction(role: Role): boolean {
  return ['OWNER', 'ADMIN'].includes(role);
}

// Check if role can approve timesheets
export function canApproveTimesheets(role: Role): boolean {
  return ['OWNER', 'ADMIN', 'MANAGER'].includes(role);
}

// Check if role can approve leave requests
export function canApproveLeave(role: Role): boolean {
  return ['OWNER', 'ADMIN', 'HR', 'MANAGER'].includes(role);
}

// Check if role can access payroll information
export function canAccessPayroll(role: Role): boolean {
  return ['OWNER', 'ADMIN', 'HR'].includes(role);
}

// Check if role can manage employees
export function canManageEmployees(role: Role): boolean {
  return ['OWNER', 'ADMIN', 'HR'].includes(role);
}
