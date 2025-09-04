import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Eye } from "lucide-react";
import { format } from "date-fns";
interface LeaveRequestsProps {
  requests: any[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isLoading?: boolean;
}

// Mock data for demonstration
const mockLeaveRequests = [
  {
    id: 'leave-1',
    employeeName: 'Alex Thompson',
    initials: 'AT',
    type: 'Annual Leave',
    days: 5,
    startDate: '2024-01-22',
    endDate: '2024-01-26',
    status: 'SUBMITTED',
    reason: 'Family vacation'
  },
  {
    id: 'leave-2',
    employeeName: 'Sarah Chen',
    initials: 'SC',
    type: 'Sick Leave',
    days: 2,
    startDate: '2024-01-18',
    endDate: '2024-01-19',
    status: 'APPROVED',
    reason: 'Medical appointment'
  }
];

export default function LeaveRequests({ requests, onApprove, onReject, isLoading }: LeaveRequestsProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'SUBMITTED':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'CANCELLED':
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">Draft</Badge>;
    }
  };

  const canApprove = (status: string) => status === 'SUBMITTED';

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (format(start, 'yyyy-MM') === format(end, 'yyyy-MM')) {
      return `${format(start, 'MMM dd')} - ${format(end, 'dd, yyyy')}`;
    }
    return `${format(start, 'MMM dd, yyyy')} - ${format(end, 'MMM dd, yyyy')}`;
  };

  if (mockLeaveRequests.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-4">
          <Eye className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No leave requests found</h3>
        <p className="text-gray-600">No leave requests to display.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="leave-requests">
      {mockLeaveRequests.map((request) => (
        <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg" data-testid={`leave-request-${request.id}`}>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm" data-testid={`text-employee-initials-${request.id}`}>
                {request.initials}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900" data-testid={`text-employee-name-${request.id}`}>
                {request.employeeName}
              </p>
              <p className="text-sm text-gray-600" data-testid={`text-leave-details-${request.id}`}>
                {request.type} • {request.days} days
              </p>
              <p className="text-xs text-gray-500" data-testid={`text-leave-dates-${request.id}`}>
                {formatDateRange(request.startDate, request.endDate)}
              </p>
              {request.reason && (
                <p className="text-xs text-gray-500 mt-1" data-testid={`text-leave-reason-${request.id}`}>
                  Reason: {request.reason}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div data-testid={`badge-leave-status-${request.id}`}>
              {getStatusBadge(request.status)}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-blue-700"
                data-testid={`button-view-leave-${request.id}`}
              >
                <Eye className="w-4 h-4" />
              </Button>
              {canApprove(request.status) && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onApprove(request.id)}
                    disabled={isLoading}
                    className="text-green-600 hover:text-green-700"
                    data-testid={`button-approve-leave-${request.id}`}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReject(request.id)}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-700"
                    data-testid={`button-reject-leave-${request.id}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
