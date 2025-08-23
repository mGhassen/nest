import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  integer,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Better Auth tables
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: varchar("email").unique().notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const accounts = pgTable("accounts", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  provider: varchar("provider").notNull(),
  providerAccountId: varchar("provider_account_id").notNull(),
  refreshToken: varchar("refresh_token"),
  accessToken: varchar("access_token"),
  expiresAt: integer("expires_at"),
  tokenType: varchar("token_type"),
  scope: varchar("scope"),
  idToken: varchar("id_token"),
  sessionState: varchar("session_state"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  expires: timestamp("expires").notNull(),
  sessionToken: varchar("session_token").unique().notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: varchar("identifier").notNull(),
  token: varchar("token").notNull(),
  expires: timestamp("expires").notNull(),
});

// Companies
export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  countryCode: varchar("country_code", { length: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Memberships (User-Company relationships with roles)
export const memberships = pgTable("memberships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  companyId: varchar("company_id").notNull(),
  role: varchar("role").notNull(), // OWNER, ADMIN, HR, MANAGER, EMPLOYEE
  createdAt: timestamp("created_at").defaultNow(),
});

// Locations
export const locations = pgTable("locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  name: varchar("name").notNull(),
  countryCode: varchar("country_code", { length: 2 }).notNull(),
  timezone: varchar("timezone").notNull(),
});

// Cost Centers
export const costCenters = pgTable("cost_centers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  code: varchar("code").notNull(),
  name: varchar("name").notNull(),
});

// Work Schedules
export const workSchedules = pgTable("work_schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  name: varchar("name").notNull(),
  weeklyHours: integer("weekly_hours").notNull(),
});

// Employees
export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  userId: varchar("user_id"), // optional if not portal-enabled
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email").notNull(),
  password: varchar("password"), // Hashed password for employee portal access
  hireDate: date("hire_date").notNull(),
  terminationDate: date("termination_date"),
  employmentType: varchar("employment_type").notNull(), // FULL_TIME, PART_TIME, CONTRACTOR
  managerId: varchar("manager_id"),
  positionTitle: varchar("position_title"),
  locationId: varchar("location_id"),
  costCenterId: varchar("cost_center_id"),
  baseSalary: decimal("base_salary", { precision: 10, scale: 2 }),
  salaryPeriod: varchar("salary_period"), // MONTHLY, YEARLY
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  workScheduleId: varchar("work_schedule_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Timesheets
export const timesheets = pgTable("timesheets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull(),
  weekStart: date("week_start").notNull(),
  status: varchar("status").notNull(), // DRAFT, SUBMITTED, APPROVED, REJECTED
  submittedAt: timestamp("submitted_at"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Timesheet Entries
export const timesheetEntries = pgTable("timesheet_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  timesheetId: varchar("timesheet_id").notNull(),
  date: date("date").notNull(),
  project: varchar("project"),
  hours: decimal("hours", { precision: 4, scale: 2 }).notNull(),
  notes: text("notes"),
});

// Leave Policies
export const leavePolicies = pgTable("leave_policies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  code: varchar("code").notNull(),
  name: varchar("name").notNull(),
  accrualRule: text("accrual_rule").notNull(), // JSON rule config
  unit: varchar("unit").notNull(), // DAYS, HOURS
  carryOverMax: decimal("carry_over_max", { precision: 5, scale: 2 }),
});

// Leave Balances
export const leaveBalances = pgTable("leave_balances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull(),
  policyId: varchar("policy_id").notNull(),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  opening: decimal("opening", { precision: 5, scale: 2 }).notNull(),
  accrued: decimal("accrued", { precision: 5, scale: 2 }).notNull(),
  taken: decimal("taken", { precision: 5, scale: 2 }).notNull(),
  adjusted: decimal("adjusted", { precision: 5, scale: 2 }).notNull(),
  closing: decimal("closing", { precision: 5, scale: 2 }).notNull(),
});

// Leave Requests
export const leaveRequests = pgTable("leave_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull(),
  policyId: varchar("policy_id").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  unit: varchar("unit").notNull(), // DAYS, HOURS
  quantity: decimal("quantity", { precision: 5, scale: 2 }).notNull(),
  status: varchar("status").notNull(), // DRAFT, SUBMITTED, APPROVED, REJECTED, CANCELLED
  approverId: varchar("approver_id"),
  approvedAt: timestamp("approved_at"),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pay Items
export const payItems = pgTable("pay_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  code: varchar("code").notNull(),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // EARNING, DEDUCTION, CONTRIBUTION
  formula: text("formula"), // JS expression or template
  taxable: boolean("taxable").default(true),
  recurring: boolean("recurring").default(false),
});

// Payroll Cycles
export const payrollCycles = pgTable("payroll_cycles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  status: varchar("status").notNull(), // DRAFT, CALCULATED, APPROVED, PAID
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payroll Runs
export const payrollRuns = pgTable("payroll_runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cycleId: varchar("cycle_id").notNull(),
  employeeId: varchar("employee_id").notNull(),
  gross: decimal("gross", { precision: 10, scale: 2 }).default('0'),
  net: decimal("net", { precision: 10, scale: 2 }).default('0'),
  currency: varchar("currency", { length: 3 }).notNull(),
  payslipUrl: varchar("payslip_url"),
  generatedAt: timestamp("generated_at"),
});

// Payroll Items
export const payrollItems = pgTable("payroll_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  runId: varchar("run_id").notNull(),
  payItemId: varchar("pay_item_id").notNull(),
  label: varchar("label").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
});

// Bank Accounts
export const bankAccounts = pgTable("bank_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull(),
  iban: varchar("iban").notNull(),
  bic: varchar("bic"),
  holderName: varchar("holder_name").notNull(),
  primary: boolean("primary").default(true),
});

// Contracts
export const contracts = pgTable("contracts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull(),
  title: varchar("title").notNull(),
  version: integer("version").default(1),
  templateId: varchar("template_id"),
  signedAt: timestamp("signed_at"),
  fileUrl: varchar("file_url"),
  variables: text("variables"), // JSON key:value for template merge
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pay Schedules
export const paySchedules = pgTable("pay_schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  cadence: varchar("cadence").notNull(), // MONTHLY, BIWEEKLY, WEEKLY
  anchorDay: integer("anchor_day"), // for monthly, e.g. 25
});

// Employee Payroll Documents
export const employeePayrollDocuments = pgTable("employee_payroll_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull(),
  fileName: varchar("file_name").notNull(),
  documentUrl: varchar("document_url").notNull(),
  payrollMonth: varchar("payroll_month").notNull(), // Format: YYYY-MM
  payrollYear: integer("payroll_year").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  uploadedBy: varchar("uploaded_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Audit Logs
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  actorId: varchar("actor_id"),
  action: varchar("action").notNull(),
  entityType: varchar("entity_type").notNull(),
  entityId: varchar("entity_id").notNull(),
  before: text("before"), // JSON
  after: text("after"), // JSON
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const userRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  memberships: many(memberships),
  employee: many(employees),
}));

export const accountRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const companyRelations = relations(companies, ({ many }) => ({
  memberships: many(memberships),
  employees: many(employees),
  locations: many(locations),
  costCenters: many(costCenters),
  workSchedules: many(workSchedules),
  leavePolicies: many(leavePolicies),
  payItems: many(payItems),
  payrollCycles: many(payrollCycles),
  paySchedules: many(paySchedules),
  auditLogs: many(auditLogs),
}));

export const membershipRelations = relations(memberships, ({ one }) => ({
  user: one(users, {
    fields: [memberships.userId],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [memberships.companyId],
    references: [companies.id],
  }),
}));

export const employeeRelations = relations(employees, ({ one, many }) => ({
  user: one(users, {
    fields: [employees.userId],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [employees.companyId],
    references: [companies.id],
  }),
  location: one(locations, {
    fields: [employees.locationId],
    references: [locations.id],
  }),
  costCenter: one(costCenters, {
    fields: [employees.costCenterId],
    references: [costCenters.id],
  }),
  workSchedule: one(workSchedules, {
    fields: [employees.workScheduleId],
    references: [workSchedules.id],
  }),
  manager: one(employees, {
    fields: [employees.managerId],
    references: [employees.id],
  }),
  timesheets: many(timesheets),
  leaveBalances: many(leaveBalances),
  leaveRequests: many(leaveRequests),
  payrollRuns: many(payrollRuns),
  bankAccounts: many(bankAccounts),
  contracts: many(contracts),
  payrollDocuments: many(employeePayrollDocuments),
}));

export const timesheetRelations = relations(timesheets, ({ one, many }) => ({
  employee: one(employees, {
    fields: [timesheets.employeeId],
    references: [employees.id],
  }),
  entries: many(timesheetEntries),
}));

export const timesheetEntryRelations = relations(timesheetEntries, ({ one }) => ({
  timesheet: one(timesheets, {
    fields: [timesheetEntries.timesheetId],
    references: [timesheets.id],
  }),
}));

export const leaveRequestRelations = relations(leaveRequests, ({ one }) => ({
  employee: one(employees, {
    fields: [leaveRequests.employeeId],
    references: [employees.id],
  }),
  policy: one(leavePolicies, {
    fields: [leaveRequests.policyId],
    references: [leavePolicies.id],
  }),
  approver: one(employees, {
    fields: [leaveRequests.approverId],
    references: [employees.id],
  }),
}));

export const payrollRunRelations = relations(payrollRuns, ({ one, many }) => ({
  cycle: one(payrollCycles, {
    fields: [payrollRuns.cycleId],
    references: [payrollCycles.id],
  }),
  employee: one(employees, {
    fields: [payrollRuns.employeeId],
    references: [employees.id],
  }),
  items: many(payrollItems),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTimesheetSchema = createInsertSchema(timesheets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeaveRequestSchema = createInsertSchema(leaveRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeavePolicySchema = createInsertSchema(leavePolicies).omit({
  id: true,
});

export const insertEmployeePayrollDocumentSchema = createInsertSchema(employeePayrollDocuments).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect & {
  companyId?: string | null;
  role?: string | null;
};
export type Company = typeof companies.$inferSelect;
export type Membership = typeof memberships.$inferSelect;
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Timesheet = typeof timesheets.$inferSelect;
export type InsertTimesheet = z.infer<typeof insertTimesheetSchema>;
export type TimesheetEntry = typeof timesheetEntries.$inferSelect;
export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type InsertLeaveRequest = z.infer<typeof insertLeaveRequestSchema>;
export type LeavePolicy = typeof leavePolicies.$inferSelect;
export type LeaveBalance = typeof leaveBalances.$inferSelect;
export type PayrollCycle = typeof payrollCycles.$inferSelect;
export type PayrollRun = typeof payrollRuns.$inferSelect;
export type Location = typeof locations.$inferSelect;
export type CostCenter = typeof costCenters.$inferSelect;
export type WorkSchedule = typeof workSchedules.$inferSelect;
export type EmployeePayrollDocument = typeof employeePayrollDocuments.$inferSelect;
export type InsertEmployeePayrollDocument = z.infer<typeof insertEmployeePayrollDocumentSchema>;
