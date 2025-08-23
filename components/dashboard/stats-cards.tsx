import { Card, CardContent } from "@/components/ui/card";
import { Users, Clock, Calendar, DollarSign } from "lucide-react";

interface StatsCardsProps {
  stats?: {
    totalEmployees: number;
    pendingTimesheets: number;
    leaveRequests: number;
    payrollStatus: string;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const defaultStats = {
    totalEmployees: 0,
    pendingTimesheets: 0,
    leaveRequests: 0,
    payrollStatus: 'Ready'
  };

  const data = stats || defaultStats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="stats-cards">
      <Card className="bg-white rounded-xl border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-3xl font-bold text-gray-900 mt-2" data-testid="text-total-employees">
                {data.totalEmployees}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600">+12%</span>
            <span className="text-gray-600 ml-2">vs last month</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white rounded-xl border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Timesheets</p>
              <p className="text-3xl font-bold text-gray-900 mt-2" data-testid="text-pending-timesheets">
                {data.pendingTimesheets}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-amber-600">-5%</span>
            <span className="text-gray-600 ml-2">vs last week</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white rounded-xl border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Leave Requests</p>
              <p className="text-3xl font-bold text-gray-900 mt-2" data-testid="text-leave-requests">
                {data.leaveRequests}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600">+3</span>
            <span className="text-gray-600 ml-2">this week</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white rounded-xl border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Payroll Status</p>
              <p className="text-3xl font-bold text-gray-900 mt-2" data-testid="text-payroll-status">
                {data.payrollStatus}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600">On schedule</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
