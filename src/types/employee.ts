// Shared types for employee-related components

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
