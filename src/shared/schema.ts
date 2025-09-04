import { z } from "zod";

// User schema for authentication
export const User = z.object({
  id: z.string(),
  email: z.string().email(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  role: z.enum(['ADMIN', 'EMPLOYEE', 'SUPERUSER']).optional(),
  is_active: z.boolean().optional(),
  profile_image_url: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type User = z.infer<typeof User>;

// Company schema
export const Company = z.object({
  id: z.string(),
  name: z.string(),
  industry: z.string().optional(),
  company_size: z.string().optional(),
  country_code: z.string().optional(),
  currency: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Company = z.infer<typeof Company>;

// Leave Request schema
export const LeaveRequest = z.object({
  id: z.string(),
  employee_id: z.string(),
  leave_type: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  reason: z.string().optional(),
  status: z.enum(['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED']),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type LeaveRequest = z.infer<typeof LeaveRequest>;

// Timesheet schema
export const Timesheet = z.object({
  id: z.string(),
  employee_id: z.string(),
  week_start: z.string(),
  week_end: z.string(),
  status: z.enum(['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED']),
  total_hours: z.number().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Timesheet = z.infer<typeof Timesheet>;