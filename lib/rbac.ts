import { db } from "./db"
import { users, memberships, employees } from "./db/schema"
import { eq, and } from "drizzle-orm"

export type Role = "OWNER" | "ADMIN" | "HR" | "MANAGER" | "EMPLOYEE"
export type Action = "read" | "write" | "delete" | "approve" | "admin"
export type Entity = "employee" | "timesheet" | "leave" | "payroll" | "company" | "settings"

interface UserWithRole {
  id: string
  email: string
  role: Role
  companyId: string
}

// Permission matrix
const permissions: Record<Role, Record<Entity, Action[]>> = {
  OWNER: {
    employee: ["read", "write", "delete", "approve", "admin"],
    timesheet: ["read", "write", "delete", "approve", "admin"],
    leave: ["read", "write", "delete", "approve", "admin"],
    payroll: ["read", "write", "delete", "approve", "admin"],
    company: ["read", "write", "delete", "approve", "admin"],
    settings: ["read", "write", "delete", "approve", "admin"],
  },
  ADMIN: {
    employee: ["read", "write", "delete", "approve", "admin"],
    timesheet: ["read", "write", "delete", "approve", "admin"],
    leave: ["read", "write", "delete", "approve", "admin"],
    payroll: ["read", "write", "delete", "approve", "admin"],
    company: ["read", "write", "admin"],
    settings: ["read", "write", "admin"],
  },
  HR: {
    employee: ["read", "write", "approve"],
    timesheet: ["read", "approve"],
    leave: ["read", "write", "approve"],
    payroll: ["read", "write", "approve"],
    company: ["read", "write"],
    settings: ["read", "write"],
  },
  MANAGER: {
    employee: ["read"],
    timesheet: ["read", "approve"],
    leave: ["read", "approve"],
    payroll: ["read"],
    company: ["read"],
    settings: ["read"],
  },
  EMPLOYEE: {
    employee: ["read"],
    timesheet: ["read", "write"],
    leave: ["read", "write"],
    payroll: ["read"],
    company: ["read"],
    settings: ["read"],
  },
}

export async function getUserWithRole(userId: string): Promise<UserWithRole | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      memberships: {
        with: {
          company: true,
        },
      },
    },
  })

  if (!user || !user.memberships?.[0]) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    role: user.memberships[0].role as Role,
    companyId: user.memberships[0].companyId,
  }
}

export function can(role: Role, action: Action, entity: Entity): boolean {
  return permissions[role]?.[entity]?.includes(action) || false
}

export async function canAccessEmployee(userId: string, targetEmployeeId: string): Promise<boolean> {
  const user = await getUserWithRole(userId)
  if (!user) return false

  // OWNER, ADMIN, HR can access all employees
  if (["OWNER", "ADMIN", "HR"].includes(user.role)) {
    return true
  }

  // MANAGER can access direct reports
  if (user.role === "MANAGER") {
    const targetEmployee = await db.query.employees.findFirst({
      where: eq(employees.id, targetEmployeeId),
    })
    return targetEmployee?.managerId === userId
  }

  // EMPLOYEE can only access themselves
  if (user.role === "EMPLOYEE") {
    const targetEmployee = await db.query.employees.findFirst({
      where: eq(employees.id, targetEmployeeId),
    })
    return targetEmployee?.userId === userId
  }

  return false
}

export async function canApproveTimesheet(userId: string, timesheetId: string): Promise<boolean> {
  const user = await getUserWithRole(userId)
  if (!user) return false

  // OWNER, ADMIN, HR can approve all timesheets
  if (["OWNER", "ADMIN", "HR"].includes(user.role)) {
    return true
  }

  // MANAGER can approve direct reports' timesheets
  if (user.role === "MANAGER") {
    const timesheet = await db.query.timesheets.findFirst({
      where: eq(timesheets.id, timesheetId),
      with: {
        employee: true,
      },
    })
    return timesheet?.employee?.managerId === userId
  }

  return false
}

export async function canApproveLeave(userId: string, leaveRequestId: string): Promise<boolean> {
  const user = await getUserWithRole(userId)
  if (!user) return false

  // OWNER, ADMIN, HR can approve all leave requests
  if (["OWNER", "ADMIN", "HR"].includes(user.role)) {
    return true
  }

  // MANAGER can approve direct reports' leave requests
  if (user.role === "MANAGER") {
    const leaveRequest = await db.query.leaveRequests.findFirst({
      where: eq(leaveRequests.id, leaveRequestId),
      with: {
        employee: true,
      },
    })
    return leaveRequest?.employee?.managerId === userId
  }

  return false
}
