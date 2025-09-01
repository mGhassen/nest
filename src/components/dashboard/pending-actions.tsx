import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LeaveRequest, Timesheet } from "@/types/leave-request";
import {
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export default function PendingActions() {
  const { user } = useAuth();
  // For now, we'll use a default company ID or get it from user context
  // TODO: Add companyId to User interface or get it from a different source
  const companyId = user?.id; // Using user ID as fallback

  // Fetch pending leave requests
  const { data: leaveRequests = [] } = useQuery<LeaveRequest[]>({
    queryKey: ['/api/leave'],
    queryFn: async () => {
      const response = await fetch('/api/leave');
      if (!response.ok) {
        throw new Error('Failed to fetch leave requests');
      }
      return response.json();
    },
    enabled: !!companyId,
  });

  // Fetch pending timesheets  
  const { data: timesheets = [] } = useQuery<Timesheet[]>({
    queryKey: ['/api/timesheets'],
    queryFn: async () => {
      const response = await fetch('/api/timesheets');
      if (!response.ok) {
        throw new Error('Failed to fetch timesheets');
      }
      return response.json();
    },
    enabled: !!companyId,
  });

  const pendingLeaveRequests = leaveRequests.filter((request) =>
    request.status === 'SUBMITTED'
  );

  const pendingTimesheets = timesheets.filter((timesheet) =>
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
            <h3 className="text-lg font-medium text-foreground mb-2">All Caught Up!</h3>
            <p className="text-muted-foreground">No pending actions require your attention.</p>
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
          <div className="border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <span className="font-medium text-orange-900 dark:text-orange-100">Leave Requests</span>
                <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200" data-testid="badge-leave-pending">
                  {pendingLeaveRequests.length} pending
                </Badge>
              </div>
              <Link href="/leave">
                <Button size="sm" variant="outline" className="text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700" data-testid="button-view-leave">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="space-y-2">
              {pendingLeaveRequests.slice(0, 3).map((request) => (
                <div key={request.id} className="flex items-center justify-between text-sm">
                  <div className="flex-1">
                    <span className="text-orange-900 dark:text-orange-100">
                      Employee leave request for {format(new Date(request.startDate), 'MMM dd')} - {format(new Date(request.endDate), 'MMM dd')}
                    </span>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button size="sm" variant="outline" className="text-green-600 dark:text-green-400 border-green-300 dark:border-green-700 h-8 px-2" data-testid={`button-approve-${request.id}`}>
                      <CheckCircle className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-700 h-8 px-2" data-testid={`button-reject-${request.id}`}>
                      <XCircle className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
              {pendingLeaveRequests.length > 3 && (
                <p className="text-xs text-orange-700 dark:text-orange-300 text-center pt-2">
                  and {pendingLeaveRequests.length - 3} more...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Pending Timesheets */}
        {pendingTimesheets.length > 0 && (
          <div className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-blue-900 dark:text-blue-100">Timesheet Approvals</span>
                <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200" data-testid="badge-timesheet-pending">
                  {pendingTimesheets.length} pending
                </Badge>
              </div>
              <Link href="/timesheets">
                <Button size="sm" variant="outline" className="text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700" data-testid="button-view-timesheets">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="space-y-2">
              {pendingTimesheets.slice(0, 3).map((timesheet: Timesheet) => (
                <div key={timesheet.id} className="flex items-center justify-between text-sm">
                  <div className="flex-1">
                    <span className="text-blue-900 dark:text-blue-100">
                      Timesheet for week of {format(new Date(timesheet.weekStart), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button size="sm" variant="outline" className="text-green-600 dark:text-green-400 border-green-300 dark:border-green-700 h-8 px-2" data-testid={`button-approve-timesheet-${timesheet.id}`}>
                      <CheckCircle className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-700 h-8 px-2" data-testid={`button-reject-timesheet-${timesheet.id}`}>
                      <XCircle className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
              {pendingTimesheets.length > 3 && (
                <p className="text-xs text-blue-700 dark:text-blue-300 text-center pt-2">
                  and {pendingTimesheets.length - 3} more...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Quick Actions</span>
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