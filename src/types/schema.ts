import { Database } from './database.types'

export type Tables = Database['public']['Tables']
export type TableName = keyof Tables

type GetTableType<T extends TableName> = Tables[T] extends { Row: infer R } ? R : never

export type Employee = GetTableType<'employees'>
export type Company = GetTableType<'companies'>
export type Location = GetTableType<'locations'>
export type CostCenter = GetTableType<'cost_centers'>
export type WorkSchedule = GetTableType<'work_schedules'>
export type Timesheet = GetTableType<'timesheets'>
export type TimesheetEntry = GetTableType<'timesheet_entries'>
export type LeaveRequest = GetTableType<'leave_requests'>
export type LeavePolicy = GetTableType<'leave_policies'>
export type PayrollCycle = GetTableType<'payroll_cycles'>
export type Account = GetTableType<'accounts'>
export type AuditLog = GetTableType<'audit_logs'>

export type InsertEmployee = Omit<Employee, 'id' | 'created_at' | 'updated_at'>
export type UpdateEmployee = Partial<InsertEmployee>

export type InsertTimesheet = Omit<Timesheet, 'id' | 'created_at' | 'updated_at'>
export type UpdateTimesheet = Partial<InsertTimesheet>

export type InsertLeaveRequest = Omit<LeaveRequest, 'id' | 'created_at' | 'updated_at'>
export type UpdateLeaveRequest = Partial<InsertLeaveRequest>

export type InsertPayrollCycle = Omit<PayrollCycle, 'id' | 'created_at' | 'updated_at'>
export type UpdatePayrollCycle = Partial<InsertPayrollCycle>

export type InsertAccount = Omit<Account, 'id' | 'created_at' | 'updated_at'>
export type UpdateAccount = Partial<InsertAccount>

// Add other insert/update types as needed
