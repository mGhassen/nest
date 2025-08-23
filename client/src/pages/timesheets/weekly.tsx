import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { hasPermission } from "@/lib/rbac";
import TimesheetGrid from "@/components/timesheets/timesheet-grid";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { startOfWeek } from "date-fns";

export default function TimesheetsWeekly() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

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

  // Find the employee record for this user
  const { data: employeesData } = useQuery({
    queryKey: ['/api/companies', companyId, 'employees'],
    enabled: !!companyId,
  });

  const currentEmployee = employeesData?.employees?.find((emp: any) => emp.userId === user.id);

  if (!currentEmployee) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Employee Profile Not Found</h2>
          <p className="text-gray-600">You don't have an employee profile in this company. Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="timesheets-weekly">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/timesheets">
              <Button variant="outline" size="sm" data-testid="button-back-to-timesheets">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Timesheets
              </Button>
            </Link>
          </div>
        </div>

        {/* Timesheet Grid */}
        <TimesheetGrid 
          employeeId={currentEmployee.id} 
          weekStart={currentWeek}
          onWeekChange={setCurrentWeek}
        />
      </div>
    </div>
  );
}
