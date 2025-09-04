import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Eye } from "lucide-react";
import { format, addDays } from "date-fns";
interface TimesheetGridProps {
  timesheets: any[];
  selectedWeek: Date;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isLoading?: boolean;
}

// Mock data for demonstration - this would come from the timesheet entries
const mockTimesheetData = [
  {
    employeeId: 'employee-1',
    employeeName: 'Sarah Chen',
    initials: 'SC',
    status: 'APPROVED',
    hours: [8.0, 8.0, 8.0, 8.0, 6.0],
    total: 38.0
  },
  {
    employeeId: 'employee-2',
    employeeName: 'Mark Rodriguez',
    initials: 'MR',
    status: 'SUBMITTED',
    hours: [8.0, 8.0, 8.0, 8.0, 8.0],
    total: 40.0
  },
  {
    employeeId: 'employee-3',
    employeeName: 'Alex Thompson',
    initials: 'AT',
    status: 'DRAFT',
    hours: [8.0, 8.0, 7.5, 8.0, 0.0],
    total: 31.5
  }
];

export default function TimesheetGrid({ timesheets, selectedWeek, onApprove, onReject, isLoading }: TimesheetGridProps) {
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'SUBMITTED':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Draft</Badge>;
    }
  };

  const canApprove = (status: string) => status === 'SUBMITTED';

  if (mockTimesheetData.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-4">
          <Eye className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No timesheets found</h3>
        <p className="text-gray-600">No timesheet data for the selected week.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto" data-testid="timesheet-grid">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Employee
            </th>
            {weekDays.map((day, index) => (
              <th key={day} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                {day}
                <br />
                <span className="text-xs text-gray-400">
                  {format(addDays(selectedWeek, index), 'MM/dd')}
                </span>
              </th>
            ))}
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {mockTimesheetData.map((timesheet) => (
            <tr key={timesheet.employeeId} data-testid={`timesheet-row-${timesheet.employeeId}`}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-xs" data-testid={`text-employee-initials-${timesheet.employeeId}`}>
                      {timesheet.initials}
                    </span>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900" data-testid={`text-employee-name-${timesheet.employeeId}`}>
                      {timesheet.employeeName}
                    </div>
                  </div>
                </div>
              </td>
              {timesheet.hours.map((hours, index) => (
                <td key={index} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900" data-testid={`text-hours-${timesheet.employeeId}-${index}`}>
                  {hours}
                </td>
              ))}
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900" data-testid={`text-total-hours-${timesheet.employeeId}`}>
                {timesheet.total}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center" data-testid={`badge-timesheet-status-${timesheet.employeeId}`}>
                {getStatusBadge(timesheet.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="flex justify-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-blue-700"
                    data-testid={`button-view-timesheet-${timesheet.employeeId}`}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  {canApprove(timesheet.status) && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onApprove(timesheet.employeeId)}
                        disabled={isLoading}
                        className="text-green-600 hover:text-green-700"
                        data-testid={`button-approve-timesheet-${timesheet.employeeId}`}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onReject(timesheet.employeeId)}
                        disabled={isLoading}
                        className="text-red-600 hover:text-red-700"
                        data-testid={`button-reject-timesheet-${timesheet.employeeId}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
