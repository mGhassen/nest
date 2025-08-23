import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Clock, User } from "lucide-react";
import type { LeaveRequest } from "@shared/schema";

interface LeaveRequestsTableProps {
  requests: LeaveRequest[];
  isLoading?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800';
    case 'SUBMITTED':
      return 'bg-yellow-100 text-yellow-800';
    case 'APPROVED':
      return 'bg-green-100 text-green-800';
    case 'REJECTED':
      return 'bg-red-100 text-red-800';
    case 'CANCELLED':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'DRAFT':
      return 'Draft';
    case 'SUBMITTED':
      return 'Pending Review';
    case 'APPROVED':
      return 'Approved';
    case 'REJECTED':
      return 'Rejected';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status;
  }
};

export function LeaveRequestsTable({ requests, isLoading }: LeaveRequestsTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No leave requests found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Submit your first leave request to get started
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border" data-testid="table-leave-requests">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Leave Type</TableHead>
            <TableHead>Period</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Reason</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id} data-testid={`row-leave-${request.id}`}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span data-testid={`text-policy-${request.id}`}>
                    Leave Request
                  </span>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">
                    <div data-testid={`text-dates-${request.id}`}>
                      {format(new Date(request.startDate), 'MMM dd')} - {format(new Date(request.endDate), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm" data-testid={`text-duration-${request.id}`}>
                    {request.quantity} {request.unit.toLowerCase()}
                  </span>
                </div>
              </TableCell>
              
              <TableCell>
                <Badge 
                  className={getStatusColor(request.status)}
                  data-testid={`badge-status-${request.id}`}
                >
                  {getStatusLabel(request.status)}
                </Badge>
              </TableCell>
              
              <TableCell className="text-sm text-muted-foreground">
                <span data-testid={`text-submitted-${request.id}`}>
                  {request.createdAt ? format(new Date(request.createdAt), 'MMM dd, yyyy') : 'N/A'}
                </span>
              </TableCell>
              
              <TableCell className="text-sm text-muted-foreground max-w-xs">
                <span 
                  className="truncate" 
                  title={request.reason || "No reason provided"}
                  data-testid={`text-reason-${request.id}`}
                >
                  {request.reason || "No reason provided"}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}