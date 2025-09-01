export interface LeaveRequest {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'SUBMITTED';
  startDate: string;
  endDate: string;
  type: string;
  employee: {
    firstName: string;
    lastName: string;
  };
  // Add other fields as needed
}

export interface Timesheet {
  id: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  startDate: string;
  endDate: string;
  employee: {
    firstName: string;
    lastName: string;
  };
  // Add other fields as needed
}
