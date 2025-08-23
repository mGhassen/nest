import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { hasPermission } from "@/lib/rbac";
import LeaveRequests from "@/components/leave/leave-requests";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { Calendar, Clock, TrendingUp, Users, CalendarCheck, CalendarX } from "lucide-react";

export default function LeaveIndex() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

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
  const canViewLeave = hasPermission(membership, "leave:read");
  const canManagePolicies = hasPermission(membership, "admin:update");
  const isManager = ["OWNER", "ADMIN", "HR", "MANAGER"].includes(membership.role);

  if (!canViewLeave) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view leave management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="leave-index">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
            <p className="text-gray-600">Manage leave policies, balances, and requests</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/leave/calendar">
              <Button variant="outline" data-testid="button-view-calendar">
                <Calendar className="w-4 h-4 mr-2" />
                Team Calendar
              </Button>
            </Link>
            {canManagePolicies && (
              <Button data-testid="button-manage-policies">
                <TrendingUp className="w-4 h-4 mr-2" />
                Manage Policies
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <LeaveStats companyId={companyId} />

        {/* Tabs */}
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList>
            <TabsTrigger value="requests">Leave Requests</TabsTrigger>
            <TabsTrigger value="balances">My Balances</TabsTrigger>
            {isManager && <TabsTrigger value="team">Team Overview</TabsTrigger>}
            {canManagePolicies && <TabsTrigger value="policies">Policies</TabsTrigger>}
          </TabsList>

          {/* Leave Requests */}
          <TabsContent value="requests">
            <LeaveRequests companyId={companyId} />
          </TabsContent>

          {/* My Balances */}
          <TabsContent value="balances">
            <LeaveBalances companyId={companyId} userId={user.id} />
          </TabsContent>

          {/* Team Overview */}
          {isManager && (
            <TabsContent value="team">
              <TeamLeaveOverview companyId={companyId} />
            </TabsContent>
          )}

          {/* Policies */}
          {canManagePolicies && (
            <TabsContent value="policies">
              <LeavePolicies companyId={companyId} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

function LeaveStats({ companyId }: { companyId: string }) {
  const { data: leaveRequests } = useQuery({
    queryKey: ['/api/companies', companyId, 'leave-requests'],
    enabled: !!companyId,
  });

  const stats = {
    pending: leaveRequests?.filter((r: any) => r.status === 'SUBMITTED').length || 0,
    approved: leaveRequests?.filter((r: any) => r.status === 'APPROVED').length || 0,
    onLeaveToday: 0, // Would need more complex logic to calculate
    totalDaysAvailable: 2340, // Would need to sum all employee balances
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Requests</p>
              <p className="text-3xl font-bold text-primary">{stats.pending}</p>
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
              <p className="text-sm font-medium text-gray-600">Approved This Month</p>
              <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <CalendarCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">On Leave Today</p>
              <p className="text-3xl font-bold text-amber-600">{stats.onLeaveToday}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
              <CalendarX className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Days Available</p>
              <p className="text-3xl font-bold text-gray-700">{stats.totalDaysAvailable}</p>
            </div>
            <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LeaveBalances({ companyId, userId }: { companyId: string; userId: string }) {
  // Find current employee
  const { data: employeesData } = useQuery({
    queryKey: ['/api/companies', companyId, 'employees'],
    enabled: !!companyId,
  });

  const currentEmployee = employeesData?.employees?.find((emp: any) => emp.userId === userId);

  const { data: balances, isLoading } = useQuery({
    queryKey: ['/api/employees', currentEmployee?.id, 'leave-balances'],
    enabled: !!currentEmployee?.id,
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
        <CardTitle>My Leave Balances</CardTitle>
        <CardDescription>Your current leave entitlements and usage</CardDescription>
      </CardHeader>
      <CardContent>
        {!balances || balances.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Leave Balances</h3>
            <p className="text-gray-600">No leave balances have been set up yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {balances.map((balance: any) => (
              <div key={balance.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Leave Policy #{balance.policyId}</h4>
                  <p className="text-sm text-gray-600">
                    Period: {new Date(balance.periodStart).toLocaleDateString()} - {new Date(balance.periodEnd).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{Number(balance.closing).toFixed(1)} days</p>
                  <p className="text-sm text-gray-600">Available</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TeamLeaveOverview({ companyId }: { companyId: string }) {
  const { data: leaveRequests, isLoading } = useQuery({
    queryKey: ['/api/companies', companyId, 'leave-requests'],
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
        <CardTitle>Team Leave Overview</CardTitle>
        <CardDescription>Recent leave activity across your team</CardDescription>
      </CardHeader>
      <CardContent>
        {!leaveRequests || leaveRequests.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Team Data</h3>
            <p className="text-gray-600">No leave requests from your team yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leaveRequests.slice(0, 5).map((request: any) => (
              <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Employee #{request.employeeId}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{request.quantity} {request.unit.toLowerCase()}</p>
                  <p className="text-xs text-gray-500">{request.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LeavePolicies({ companyId }: { companyId: string }) {
  const { data: policies, isLoading } = useQuery({
    queryKey: ['/api/companies', companyId, 'leave-policies'],
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
        <CardTitle>Leave Policies</CardTitle>
        <CardDescription>Configure leave types and accrual rules</CardDescription>
      </CardHeader>
      <CardContent>
        {!policies || policies.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Policies Configured</h3>
            <p className="text-gray-600">Set up leave policies to get started.</p>
            <Button className="mt-4">Create Policy</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {policies.map((policy: any) => (
              <div key={policy.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{policy.name}</h4>
                  <p className="text-sm text-gray-600">Code: {policy.code} • Unit: {policy.unit}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900">
                    Carry over: {policy.carryOverMax ? `${policy.carryOverMax} ${policy.unit.toLowerCase()}` : 'None'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
