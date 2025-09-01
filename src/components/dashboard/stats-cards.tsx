import { Card, CardContent } from "@/components/ui/card";
import { Users, Clock, Calendar, DollarSign } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useDashboardStats } from "@/hooks/use-analytics";

interface StatsCardsProps {
  stats?: {
    totalEmployees: number;
    pendingTimesheets: number;
    leaveRequests: number;
    payrollStatus: string;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const { user } = useAuth();
  
  // Fetch analytics data using custom hook
  const { data: analyticsData } = useDashboardStats();

  const defaultStats = {
    totalEmployees: 0,
    pendingTimesheets: 0,
    leaveRequests: 0,
    payrollStatus: 'Ready'
  };

  const data = stats || analyticsData || defaultStats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="stats-cards">
      <Card className="rounded-xl border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
              <p className="text-3xl font-bold text-foreground mt-2" data-testid="text-total-employees">
                {data.totalEmployees}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600">+12%</span>
            <span className="text-muted-foreground ml-2">vs last month</span>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Timesheets</p>
              <p className="text-3xl font-bold text-foreground mt-2" data-testid="text-pending-timesheets">
                {data.pendingTimesheets}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-amber-600 dark:text-amber-400">-5%</span>
            <span className="text-muted-foreground ml-2">vs last week</span>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Leave Requests</p>
              <p className="text-3xl font-bold text-foreground mt-2" data-testid="text-leave-requests">
                {data.leaveRequests}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 dark:bg-green-950/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 dark:text-green-400">+3</span>
            <span className="text-muted-foreground ml-2">this week</span>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Payroll Status</p>
              <p className="text-3xl font-bold text-foreground mt-2" data-testid="text-payroll-status">
                {data.payrollStatus}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-950/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 dark:text-green-400">On schedule</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
