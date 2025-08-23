import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FileText,
  Users,
  ArrowRight
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

export default function PendingActions() {
  const { user } = useAuth();
  const companyId = user?.companyId;

  // Fetch pending leave requests
  const { data: leaveRequests = [] } = useQuery({
    queryKey: ['/api/leave-requests'],
    enabled: !!companyId,
  });

  // Fetch pending timesheets  
  const { data: timesheets = [] } = useQuery({
    queryKey: ['/api/companies', companyId, 'timesheets'],
    enabled: !!companyId,
  });

  const pendingLeaveRequests = leaveRequests.filter((request: any) => 
    request.status === 'SUBMITTED'
  );

  const pendingTimesheets = timesheets.filter((timesheet: any) => 
    timesheet.status === 'SUBMITTED'
  );

  const totalPendingActions = pendingLeaveRequests.length + pendingTimesheets.length;

  if (totalPendingActions === 0) {
    return (
      <Card data-testid="card-pending-actions">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
            Pending Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-gray-600">No pending actions require your attention.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-pending-actions">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-amber-600" />
            Pending Actions
          </div>
          <Badge variant="destructive" data-testid="badge-total-pending">
            {totalPendingActions} items
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pending Leave Requests */}
        {pendingLeaveRequests.length > 0 && (
          <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-orange-900">Leave Requests</span>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800" data-testid="badge-leave-pending">
                  {pendingLeaveRequests.length} pending
                </Badge>
              </div>
              <Link href="/leave">
                <Button size="sm" variant="outline" className="text-orange-700 border-orange-300" data-testid="button-view-leave">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="space-y-2">
              {pendingLeaveRequests.slice(0, 3).map((request: any) => (
                <div key={request.id} className="flex items-center justify-between text-sm">
                  <div className="flex-1">
                    <span className="text-orange-900">
                      Employee leave request for {format(new Date(request.startDate), 'MMM dd')} - {format(new Date(request.endDate), 'MMM dd')}
                    </span>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button size="sm" variant="outline" className="text-green-600 border-green-300 h-8 px-2" data-testid={`button-approve-${request.id}`}>
                      <CheckCircle className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-300 h-8 px-2" data-testid={`button-reject-${request.id}`}>
                      <XCircle className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
              {pendingLeaveRequests.length > 3 && (
                <p className="text-xs text-orange-700 text-center pt-2">
                  and {pendingLeaveRequests.length - 3} more...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Pending Timesheets */}
        {pendingTimesheets.length > 0 && (
          <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Timesheet Approvals</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800" data-testid="badge-timesheet-pending">
                  {pendingTimesheets.length} pending
                </Badge>
              </div>
              <Link href="/timesheets">
                <Button size="sm" variant="outline" className="text-blue-700 border-blue-300" data-testid="button-view-timesheets">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="space-y-2">
              {pendingTimesheets.slice(0, 3).map((timesheet: any) => (
                <div key={timesheet.id} className="flex items-center justify-between text-sm">
                  <div className="flex-1">
                    <span className="text-blue-900">
                      Timesheet for week of {format(new Date(timesheet.weekStart), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button size="sm" variant="outline" className="text-green-600 border-green-300 h-8 px-2" data-testid={`button-approve-timesheet-${timesheet.id}`}>
                      <CheckCircle className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-300 h-8 px-2" data-testid={`button-reject-timesheet-${timesheet.id}`}>
                      <XCircle className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
              {pendingTimesheets.length > 3 && (
                <p className="text-xs text-blue-700 text-center pt-2">
                  and {pendingTimesheets.length - 3} more...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Quick Actions</span>
            <div className="flex space-x-2">
              <Link href="/leave">
                <Button size="sm" variant="outline" data-testid="button-quick-leave">
                  <Calendar className="w-4 h-4 mr-1" />
                  Leave Management
                </Button>
              </Link>
              <Link href="/timesheets">
                <Button size="sm" variant="outline" data-testid="button-quick-timesheets">
                  <Clock className="w-4 h-4 mr-1" />
                  Timesheet Review
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}