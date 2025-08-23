import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { hasPermission } from "@/lib/rbac";
import { TIMESHEET_STATUSES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "wouter";
import { Clock, Calendar, TrendingUp, Download, CheckCircle, XCircle } from "lucide-react";
import { format, startOfWeek } from "date-fns";

export default function TimesheetsIndex() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [selectedWeek, setSelectedWeek] = useState(format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Get the first company membership
  const membership = user.memberships?.[0];
  const companyId = membership?.companyId;

  if (!companyId) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Company Access</h2>
          <p className="text-gray-600">You don't have access to any company. Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  // Check permissions
  const canViewTimesheets = hasPermission(membership, "timesheet:read");
  const canApprove = hasPermission(membership, "timesheet:approve");
  const isManager = ["OWNER", "ADMIN", "HR", "MANAGER"].includes(membership.role);

  if (!canViewTimesheets) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view timesheets.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="timesheets-index">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Timesheets</h1>
            <p className="text-gray-600">Manage time tracking and approvals</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" data-testid="button-export-timesheets">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Link href="/timesheets/weekly">
              <Button data-testid="button-my-timesheet">
                <Clock className="w-4 h-4 mr-2" />
                My Timesheet
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <TimesheetStats companyId={companyId} />

        {/* Tabs */}
        <Tabs defaultValue={isManager ? "overview" : "my-timesheets"} className="space-y-6">
          <TabsList>
            <TabsTrigger value="my-timesheets">My Timesheets</TabsTrigger>
            {isManager && <TabsTrigger value="overview">Team Overview</TabsTrigger>}
            {canApprove && <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>}
          </TabsList>

          {/* My Timesheets */}
          <TabsContent value="my-timesheets">
            <MyTimesheets userId={user.id} />
          </TabsContent>

          {/* Team Overview */}
          {isManager && (
            <TabsContent value="overview">
              <TeamTimesheetsOverview companyId={companyId} />
            </TabsContent>
          )}

          {/* Pending Approvals */}
          {canApprove && (
            <TabsContent value="approvals">
              <PendingApprovals companyId={companyId} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

function TimesheetStats({ companyId }: { companyId: string }) {
  const { data: timesheets } = useQuery({
    queryKey: ['/api/companies', companyId, 'timesheets'],
    enabled: !!companyId,
  });

  const stats = {
    submitted: timesheets?.filter((t: any) => t.status === 'SUBMITTED').length || 0,
    pending: timesheets?.filter((t: any) => t.status === 'SUBMITTED').length || 0,
    approved: timesheets?.filter((t: any) => t.status === 'APPROVED').length || 0,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Submitted</p>
              <p className="text-3xl font-bold text-gray-900">{stats.submitted}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MyTimesheets({ userId }: { userId: string }) {
  // This would need to find the employee record for this user
  // For now, we'll show a placeholder
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Recent Timesheets</CardTitle>
        <CardDescription>Your timesheet submission history</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Timesheets Yet</h3>
          <p className="text-gray-600 mb-4">Start tracking your time by creating your first timesheet.</p>
          <Link href="/timesheets/weekly">
            <Button>Create Timesheet</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamTimesheetsOverview({ companyId }: { companyId: string }) {
  const { data: timesheets, isLoading } = useQuery({
    queryKey: ['/api/companies', companyId, 'timesheets'],
    enabled: !!companyId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Timesheets Overview</CardTitle>
        <CardDescription>Weekly timesheet status across your team</CardDescription>
      </CardHeader>
      <CardContent>
        {!timesheets || timesheets.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600">No timesheet data to display yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {timesheets.slice(0, 5).map((timesheet: any) => (
              <div key={timesheet.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Employee #{timesheet.employeeId}</p>
                  <p className="text-sm text-gray-600">Week of {format(new Date(timesheet.weekStart), 'MMM dd, yyyy')}</p>
                </div>
                <Badge variant={timesheet.status === 'APPROVED' ? 'default' : 'secondary'}>
                  {timesheet.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PendingApprovals({ companyId }: { companyId: string }) {
  const { data: timesheets, isLoading } = useQuery({
    queryKey: ['/api/companies', companyId, 'timesheets', { status: 'SUBMITTED' }],
    enabled: !!companyId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  const pendingTimesheets = timesheets?.filter((t: any) => t.status === 'SUBMITTED') || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Approvals</CardTitle>
        <CardDescription>Timesheets waiting for your approval</CardDescription>
      </CardHeader>
      <CardContent>
        {pendingTimesheets.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-gray-600">No timesheets pending approval.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingTimesheets.map((timesheet: any) => (
              <div key={timesheet.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Employee #{timesheet.employeeId}</p>
                  <p className="text-sm text-gray-600">Week of {format(new Date(timesheet.weekStart), 'MMM dd, yyyy')}</p>
                  {timesheet.submittedAt && (
                    <p className="text-xs text-gray-500">
                      Submitted {format(new Date(timesheet.submittedAt), 'MMM dd, yyyy')}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 border-red-600">
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
