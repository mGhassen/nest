// Shared types for employee-related components
import type { Employee as DatabaseEmployee } from './schema';

// Extended Employee type for the detail page with related data
export interface EmployeeDetail extends DatabaseEmployee {
  account?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    is_active: boolean;
    profile_image_url: string | null;
  } | null;
  company?: {
    id: string;
    name: string;
  } | null;
  location?: {
    id: string;
    name: string;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string;
  } | null;
  cost_center?: {
    id: string;
    code: string;
    name: string;
  } | null;
  work_schedule?: {
    id: string;
    name: string;
    weekly_hours: number;
  } | null;
  manager?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  documents: Document[];
  contracts: Contract[];
}

// Legacy Employee interface for backward compatibility
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  manager: string;
  hireDate: string;
  salary: number;
  status: string;
  avatar: string | null;
  address: string;
  emergencyContact: string;
  documents: Document[];
  contracts: Contract[];
}

export interface Document {
  id: number;
  name: string;
  type: string;
  uploadDate: string;
  status: string;
}

export interface Contract {
  id: number;
  type: string;
  status: string;
  startDate: string;
  endDate: string | null;
  signedDate: string;
}

export interface PayrollRecord {
  period: string;
  amount: number;
  status: string;
}

// Event handler types
export type EmployeeActionHandler = () => void;
export type EmployeeIdActionHandler = (employeeId: string) => void;
export type DocumentActionHandler = (documentId: number) => void;
export type ContractActionHandler = (contractId: number) => void;
