export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Custom types matching the database schema
export type UserRole = 'OWNER' | 'HR' | 'MANAGER' | 'EMPLOYEE'
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACTOR' | 'INTERN'
export type SalaryPeriod = 'HOURLY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'YEARLY'
export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'TERMINATED' | 'ON_LEAVE'
export type TimesheetStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
export type LeaveRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
export type PayrollStatus = 'DRAFT' | 'UPLOADED' | 'APPROVED' | 'PROCESSED'

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          country_code: string
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          country_code: string
          currency: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          country_code?: string
          currency?: string
          created_at?: string
          updated_at?: string
        }
      }
      
      locations: {
        Row: {
          id: string
          company_id: string
          name: string
          address: string | null
          city: string | null
          state: string | null
          country: string
          postal_code: string | null
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          address?: string | null
          city?: string | null
          state?: string | null
          country: string
          postal_code?: string | null
          timezone: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string
          postal_code?: string | null
          timezone?: string
          created_at?: string
          updated_at?: string
        }
      }
      
      cost_centers: {
        Row: {
          id: string
          company_id: string
          code: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          code: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          code?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      
      work_schedules: {
        Row: {
          id: string
          company_id: string
          name: string
          weekly_hours: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          weekly_hours: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          weekly_hours?: number
          created_at?: string
          updated_at?: string
        }
      }
      
      accounts: {
        Row: {
          id: string
          auth_user_id: string | null
          email: string
          first_name: string
          last_name: string
          profile_image_url: string | null
          role: UserRole
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_user_id?: string | null
          email: string
          first_name: string
          last_name: string
          profile_image_url?: string | null
          role?: UserRole
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_user_id?: string | null
          email?: string
          first_name?: string
          last_name?: string
          profile_image_url?: string | null
          role?: UserRole
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      
      memberships: {
        Row: {
          id: string
          user_id: string
          company_id: string
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_id: string
          role: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_id?: string
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
      }
      
      employees: {
        Row: {
          id: string
          company_id: string
          user_id: string
          first_name: string
          last_name: string
          email: string
          hire_date: string
          employment_type: EmploymentType
          position_title: string
          location_id: string | null
          cost_center_id: string | null
          work_schedule_id: string | null
          manager_id: string | null
          base_salary: number
          salary_period: SalaryPeriod
          status: EmployeeStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          user_id: string
          first_name: string
          last_name: string
          email: string
          hire_date: string
          employment_type: EmploymentType
          position_title: string
          location_id?: string | null
          cost_center_id?: string | null
          work_schedule_id?: string | null
          manager_id?: string | null
          base_salary: number
          salary_period: SalaryPeriod
          status?: EmployeeStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          user_id?: string
          first_name?: string
          last_name?: string
          email?: string
          hire_date?: string
          employment_type?: EmploymentType
          position_title?: string
          location_id?: string | null
          cost_center_id?: string | null
          work_schedule_id?: string | null
          manager_id?: string | null
          base_salary?: number
          salary_period?: SalaryPeriod
          status?: EmployeeStatus
          created_at?: string
          updated_at?: string
        }
      }
      
      leave_policies: {
        Row: {
          id: string
          company_id: string
          code: string
          name: string
          accrual_rule: Json
          unit: string
          carry_over_max: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          code: string
          name: string
          accrual_rule: Json
          unit: string
          carry_over_max?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          code?: string
          name?: string
          accrual_rule?: Json
          unit?: string
          carry_over_max?: number
          created_at?: string
          updated_at?: string
        }
      }
      
      payroll_cycles: {
        Row: {
          id: string
          company_id: string
          month: number
          year: number
          document_url: string | null
          notes: string | null
          status: PayrollStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          month: number
          year: number
          document_url?: string | null
          notes?: string | null
          status?: PayrollStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          month?: number
          year?: number
          document_url?: string | null
          notes?: string | null
          status?: PayrollStatus
          created_at?: string
          updated_at?: string
        }
      }
      
      timesheets: {
        Row: {
          id: string
          employee_id: string
          week_start: string
          status: TimesheetStatus
          total_hours: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          week_start: string
          status?: TimesheetStatus
          total_hours?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          week_start?: string
          status?: TimesheetStatus
          total_hours?: number
          created_at?: string
          updated_at?: string
        }
      }
      
      timesheet_entries: {
        Row: {
          id: string
          timesheet_id: string
          date: string
          project: string | null
          hours: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          timesheet_id: string
          date: string
          project?: string | null
          hours: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          timesheet_id?: string
          date?: string
          project?: string | null
          hours?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      
      leave_requests: {
        Row: {
          id: string
          employee_id: string
          leave_policy_id: string
          start_date: string
          end_date: string
          days_requested: number
          reason: string | null
          status: LeaveRequestStatus
          approved_by: string | null
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          leave_policy_id: string
          start_date: string
          end_date: string
          days_requested: number
          reason?: string | null
          status?: LeaveRequestStatus
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          leave_policy_id?: string
          start_date?: string
          end_date?: string
          days_requested?: number
          reason?: string | null
          status?: LeaveRequestStatus
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      
      audit_logs: {
        Row: {
          id: string
          entity_type: string
          entity_id: string | null
          action: string
          actor_id: string | null
          actor_email: string | null
          old_values: Json | null
          new_values: Json | null
          metadata: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          entity_type: string
          entity_id?: string | null
          action: string
          actor_id?: string | null
          actor_email?: string | null
          old_values?: Json | null
          new_values?: Json | null
          metadata?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          entity_type?: string
          entity_id?: string | null
          action?: string
          actor_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          metadata?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
