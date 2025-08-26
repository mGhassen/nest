import {
  users,
  companies,
  memberships,
  employees,
  timesheets,
  timesheetEntries,
  leaveRequests,
  leavePolicies,
  leaveBalances,
  payrollCycles,
  payrollRuns,
  locations,
  costCenters,
  workSchedules,
  auditLogs,
  employeePayrollDocuments,
  type User,
  type UpsertUser,
  type Company,
  type Membership,
  type Employee,
  type InsertEmployee,
  type Timesheet,
  type InsertTimesheet,
  type TimesheetEntry,
  type LeaveRequest,
  type InsertLeaveRequest,
  type LeavePolicy,
  type LeaveBalance,
  type PayrollCycle,
  type Location,
  type CostCenter,
  type WorkSchedule,
  type EmployeePayrollDocument,
  type InsertEmployeePayrollDocument,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Company operations
  getCompany(id: string): Promise<Company | undefined>;
  getUserMembership(userId: string, companyId: string): Promise<Membership | undefined>;
  getUserFirstMembership(userId: string): Promise<Membership | undefined>;
  createCompanyWithOwner(userId: string, companyData: { name: string; countryCode: string; currency: string }): Promise<Company & { role: string }>;
  
  // Employee operations
  getEmployees(companyId: string): Promise<Employee[]>;
  getEmployee(id: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: string, employee: Partial<InsertEmployee>): Promise<Employee>;
  deleteEmployee(id: string): Promise<void>;
  getEmployeeByUserId(userId: string): Promise<Employee | undefined>;
  getEmployeeTimesheets(employeeId: string): Promise<any[]>;
  getEmployeeLeaveRequests(employeeId: string): Promise<any[]>;
  getEmployeePayrollDocs(employeeId: string): Promise<any[]>;
  getEmployeePayrollDocuments(employeeId: string): Promise<EmployeePayrollDocument[]>;
  createEmployeePayrollDocument(document: InsertEmployeePayrollDocument): Promise<EmployeePayrollDocument>;
  setEmployeePassword(employeeId: string, hashedPassword: string): Promise<void>;
  getEmployeeByEmail(email: string): Promise<Employee | undefined>;
  
  // Timesheet operations
  getTimesheets(companyId: string): Promise<Timesheet[]>;
  createTimesheet(timesheet: InsertTimesheet): Promise<Timesheet>;
  updateTimesheet(id: string, timesheet: Partial<InsertTimesheet>): Promise<Timesheet>;
  
  // Leave operations
  getLeaveRequests(companyId: string): Promise<LeaveRequest[]>;
  getEmployeeLeaveRequests(employeeId: string): Promise<LeaveRequest[]>;
  createLeaveRequest(request: InsertLeaveRequest): Promise<LeaveRequest>;
  updateLeaveRequest(id: string, request: Partial<InsertLeaveRequest>): Promise<LeaveRequest>;
  getCompanyLeavePolicies(companyId: string): Promise<LeavePolicy[]>;
  getEmployeeLeaveBalance(employeeId: string): Promise<LeaveBalance[]>;
  createLeavePolicy(policy: any): Promise<LeavePolicy>;
  
  // Master data operations
  getLocations(companyId: string): Promise<Location[]>;
  getCostCenters(companyId: string): Promise<CostCenter[]>;
  
  // Admin operations
  getAllEmployees(): Promise<Employee[]>;
  getAllLeaveRequests(): Promise<LeaveRequest[]>;
  getAllTimesheets(): Promise<Timesheet[]>;
  getAllLeaveRequestsWithEmployees(): Promise<any[]>;
  updateLeaveRequestStatus(id: string, status: string, reason?: string): Promise<LeaveRequest>;
  getWorkSchedules(companyId: string): Promise<WorkSchedule[]>;
  
  // Dashboard stats
  getDashboardStats(companyId: string): Promise<{
    totalEmployees: number;
    pendingTimesheets: number;
    leaveRequests: number;
    payrollStatus: string;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Company operations
  async getCompany(id: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async getUserMembership(userId: string, companyId: string): Promise<Membership | undefined> {
    const [membership] = await db
      .select()
      .from(memberships)
      .where(and(eq(memberships.userId, userId), eq(memberships.companyId, companyId)));
    return membership;
  }

  async getUserFirstMembership(userId: string): Promise<Membership | undefined> {
    const [membership] = await db
      .select()
      .from(memberships)
      .where(eq(memberships.userId, userId))
      .limit(1);
    return membership;
  }

  async createCompanyWithOwner(userId: string, companyData: { name: string; countryCode: string; currency: string }): Promise<Company & { role: string }> {
    // Create company
    const [company] = await db
      .insert(companies)
      .values(companyData)
      .returning();

    // Create owner membership
    await db
      .insert(memberships)
      .values({
        userId,
        companyId: company.id,
        role: 'OWNER'
      });

    return { ...company, role: 'OWNER' };
  }

  // Employee operations
  async getEmployees(companyId: string): Promise<Employee[]> {
    return await db
      .select()
      .from(employees)
      .where(eq(employees.companyId, companyId))
      .orderBy(desc(employees.createdAt));
  }

  async getEmployee(id: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee;
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const [newEmployee] = await db
      .insert(employees)
      .values(employee)
      .returning();
    return newEmployee;
  }

  async updateEmployee(id: string, employee: Partial<InsertEmployee>): Promise<Employee> {
    const [updatedEmployee] = await db
      .update(employees)
      .set({ ...employee, updatedAt: new Date() })
      .where(eq(employees.id, id))
      .returning();
    return updatedEmployee;
  }

  async deleteEmployee(id: string): Promise<void> {
    await db.delete(employees).where(eq(employees.id, id));
  }

  async getEmployeeByUserId(userId: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.userId, userId));
    return employee;
  }

  async getEmployeeTimesheets(employeeId: string): Promise<any[]> {
    return await db
      .select()
      .from(timesheets)
      .where(eq(timesheets.employeeId, employeeId))
      .orderBy(desc(timesheets.weekStart));
  }

  async getEmployeeLeaveRequests(employeeId: string): Promise<LeaveRequest[]> {
    return await db
      .select()
      .from(leaveRequests)
      .where(eq(leaveRequests.employeeId, employeeId))
      .orderBy(desc(leaveRequests.createdAt));
  }

  // Employee management operations
  async getAllEmployees(): Promise<Employee[]> {
    return await db
      .select()
      .from(employees)
      .orderBy(employees.firstName, employees.lastName);
  }

  async createEmployee(employeeData: InsertEmployee): Promise<Employee> {
    const [employee] = await db
      .insert(employees)
      .values(employeeData)
      .returning();
    return employee;
  }

  async deleteEmployee(id: string): Promise<void> {
    await db
      .delete(employees)
      .where(eq(employees.id, id));
  }

  async updateEmployeePassword(id: string, password: string): Promise<void> {
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await db
      .update(employees)
      .set({ password: hashedPassword })
      .where(eq(employees.id, id));
  }

  // Admin operations for leave and timesheets
  async getAllLeaveRequests(): Promise<LeaveRequest[]> {
    return await db
      .select()
      .from(leaveRequests)
      .orderBy(desc(leaveRequests.createdAt));
  }

  async getAllTimesheets(): Promise<Timesheet[]> {
    return await db
      .select()
      .from(timesheets)
      .orderBy(desc(timesheets.createdAt));
  }

  // Enhanced leave request operations with employee data
  async getAllLeaveRequestsWithEmployees(): Promise<any[]> {
    return await db
      .select({
        id: leaveRequests.id,
        employeeId: leaveRequests.employeeId,
        policyId: leaveRequests.policyId,
        startDate: leaveRequests.startDate,
        endDate: leaveRequests.endDate,
        unit: leaveRequests.unit,
        quantity: leaveRequests.quantity,
        status: leaveRequests.status,
        approverId: leaveRequests.approverId,
        reason: leaveRequests.reason,
        createdAt: leaveRequests.createdAt,
        updatedAt: leaveRequests.updatedAt,
        employee: {
          id: employees.id,
          firstName: employees.firstName,
          lastName: employees.lastName,
          email: employees.email,
          positionTitle: employees.positionTitle,
        }
      })
      .from(leaveRequests)
      .leftJoin(employees, eq(leaveRequests.employeeId, employees.id))
      .orderBy(desc(leaveRequests.createdAt));
  }

  async updateLeaveRequestStatus(id: string, status: string, reason?: string): Promise<LeaveRequest> {
    const [updatedRequest] = await db
      .update(leaveRequests)
      .set({ 
        status, 
        updatedAt: new Date(),
        approverId: 'admin' // In a real system, this would be the actual admin user ID
      })
      .where(eq(leaveRequests.id, id))
      .returning();
    return updatedRequest;
  }

  async getEmployeePayrollDocs(employeeId: string): Promise<any[]> {
    // For now return empty array - will be implemented when payroll docs are added
    return [];
  }

  async setEmployeePassword(employeeId: string, hashedPassword: string): Promise<void> {
    await db
      .update(employees)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(employees.id, employeeId));
  }

  async getEmployeeByEmail(email: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.email, email));
    return employee;
  }

  // Timesheet operations
  async getTimesheets(companyId: string): Promise<Timesheet[]> {
    return await db
      .select({
        id: timesheets.id,
        employeeId: timesheets.employeeId,
        weekStart: timesheets.weekStart,
        status: timesheets.status,
        submittedAt: timesheets.submittedAt,
        approvedAt: timesheets.approvedAt,
        createdAt: timesheets.createdAt,
        updatedAt: timesheets.updatedAt,
      })
      .from(timesheets)
      .innerJoin(employees, eq(timesheets.employeeId, employees.id))
      .where(eq(employees.companyId, companyId))
      .orderBy(desc(timesheets.weekStart));
  }

  async createTimesheet(timesheet: InsertTimesheet): Promise<Timesheet> {
    const [newTimesheet] = await db
      .insert(timesheets)
      .values(timesheet)
      .returning();
    return newTimesheet;
  }

  async updateTimesheet(id: string, timesheet: Partial<InsertTimesheet>): Promise<Timesheet> {
    const [updatedTimesheet] = await db
      .update(timesheets)
      .set({ ...timesheet, updatedAt: new Date() })
      .where(eq(timesheets.id, id))
      .returning();
    return updatedTimesheet;
  }

  // Leave operations
  async getLeaveRequests(companyId: string): Promise<LeaveRequest[]> {
    return await db
      .select({
        id: leaveRequests.id,
        employeeId: leaveRequests.employeeId,
        policyId: leaveRequests.policyId,
        startDate: leaveRequests.startDate,
        endDate: leaveRequests.endDate,
        unit: leaveRequests.unit,
        quantity: leaveRequests.quantity,
        status: leaveRequests.status,
        approverId: leaveRequests.approverId,
        reason: leaveRequests.reason,
        createdAt: leaveRequests.createdAt,
        updatedAt: leaveRequests.updatedAt,
      })
      .from(leaveRequests)
      .innerJoin(employees, eq(leaveRequests.employeeId, employees.id))
      .where(eq(employees.companyId, companyId))
      .orderBy(desc(leaveRequests.createdAt));
  }



  async createLeaveRequest(request: InsertLeaveRequest): Promise<LeaveRequest> {
    const [newRequest] = await db
      .insert(leaveRequests)
      .values(request)
      .returning();
    return newRequest;
  }

  async updateLeaveRequest(id: string, request: Partial<InsertLeaveRequest>): Promise<LeaveRequest> {
    const [updatedRequest] = await db
      .update(leaveRequests)
      .set({ ...request, updatedAt: new Date() })
      .where(eq(leaveRequests.id, id))
      .returning();
    return updatedRequest;
  }

  async getCompanyLeavePolicies(companyId: string): Promise<LeavePolicy[]> {
    return await db
      .select()
      .from(leavePolicies)
      .where(eq(leavePolicies.companyId, companyId));
  }

  async getEmployeeLeaveBalance(employeeId: string): Promise<LeaveBalance[]> {
    return await db
      .select()
      .from(leaveBalances)
      .where(eq(leaveBalances.employeeId, employeeId))
      .orderBy(desc(leaveBalances.periodEnd));
  }

  async createLeavePolicy(policyData: any): Promise<LeavePolicy> {
    const [newPolicy] = await db
      .insert(leavePolicies)
      .values(policyData)
      .returning();
    return newPolicy;
  }

  // Master data operations
  async getLocations(companyId: string): Promise<Location[]> {
    return await db
      .select()
      .from(locations)
      .where(eq(locations.companyId, companyId));
  }

  async getCostCenters(companyId: string): Promise<CostCenter[]> {
    return await db
      .select()
      .from(costCenters)
      .where(eq(costCenters.companyId, companyId));
  }

  async getWorkSchedules(companyId: string): Promise<WorkSchedule[]> {
    return await db
      .select()
      .from(workSchedules)
      .where(eq(workSchedules.companyId, companyId));
  }

  // Dashboard stats
  async getDashboardStats(companyId: string): Promise<{
    totalEmployees: number;
    pendingTimesheets: number;
    leaveRequests: number;
    payrollStatus: string;
  }> {
    const [employeeCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(employees)
      .where(eq(employees.companyId, companyId));

    const [pendingTimesheetCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(timesheets)
      .innerJoin(employees, eq(timesheets.employeeId, employees.id))
      .where(
        and(
          eq(employees.companyId, companyId),
          eq(timesheets.status, 'SUBMITTED')
        )
      );

    const [pendingLeaveCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(leaveRequests)
      .innerJoin(employees, eq(leaveRequests.employeeId, employees.id))
      .where(
        and(
          eq(employees.companyId, companyId),
          eq(leaveRequests.status, 'SUBMITTED')
        )
      );

    return {
      totalEmployees: employeeCount.count,
      pendingTimesheets: pendingTimesheetCount.count,
      leaveRequests: pendingLeaveCount.count,
      payrollStatus: 'Ready',
    };
  }

  // Payroll document operations
  async getEmployeePayrollDocuments(employeeId: string): Promise<EmployeePayrollDocument[]> {
    return await db
      .select()
      .from(employeePayrollDocuments)
      .where(eq(employeePayrollDocuments.employeeId, employeeId))
      .orderBy(desc(employeePayrollDocuments.payrollMonth), desc(employeePayrollDocuments.uploadedAt));
  }

  async createEmployeePayrollDocument(document: InsertEmployeePayrollDocument): Promise<EmployeePayrollDocument> {
    const [newDocument] = await db
      .insert(employeePayrollDocuments)
      .values(document)
      .returning();
    return newDocument;
  }
}

export const storage = new DatabaseStorage();
