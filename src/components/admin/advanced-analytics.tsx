import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  Calendar,
  AlertTriangle 
} from "lucide-react";

export default function AdvancedAnalytics() {
  const { data: analytics } = useQuery({
    queryKey: ['/api/analytics/advanced'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/advanced');
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      return response.json();
    },
    retry: false,
  });

  // Fallback to sample data if API not available
  const analyticsData = analytics || {
    employeeGrowth: {
      current: 12,
      previous: 10,
      trend: 'up',
      percentage: 20
    },
    averageProductivity: {
      score: 8.2,
      trend: 'up',
      change: 0.3
    },
    leaveUtilization: {
      percentage: 72,
      trend: 'down',
      change: -5
    },
    upcomingReviews: 3,
    pendingOnboarding: 2,
    atRiskEmployees: 1
  };

  return (
    <div className="space-y-6">
      {/* Advanced Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employee Growth</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.employeeGrowth.current}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {analyticsData.employeeGrowth.trend === 'up' ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={analyticsData.employeeGrowth.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                {analyticsData.employeeGrowth.percentage}% from last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productivity Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.averageProductivity.score}/10</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+{analyticsData.averageProductivity.change} this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leave Utilization</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.leaveUtilization.percentage}%</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 text-blue-500" />
              <span className="text-blue-500">{analyticsData.leaveUtilization.change}% optimal range</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Action Items & Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-900">Upcoming Performance Reviews</p>
                  <p className="text-sm text-orange-700">{analyticsData.upcomingReviews} employees due for review this month</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {analyticsData.upcomingReviews} pending
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Pending Onboarding</p>
                  <p className="text-sm text-blue-700">{analyticsData.pendingOnboarding} new hires need onboarding setup</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {analyticsData.pendingOnboarding} pending
              </Badge>
            </div>

            {analyticsData.atRiskEmployees > 0 && (
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-900">At-Risk Employees</p>
                    <p className="text-sm text-red-700">{analyticsData.atRiskEmployees} employee(s) showing concerning patterns</p>
                  </div>
                </div>
                <Badge variant="destructive">
                  Attention needed
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}