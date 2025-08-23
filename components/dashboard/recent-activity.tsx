import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Check, FileText } from "lucide-react";

const activities = [
  {
    id: '1',
    type: 'timesheet_submitted',
    icon: UserPlus,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    title: 'Sarah Chen submitted timesheet for week of Jan 15, 2024',
    time: '2 minutes ago'
  },
  {
    id: '2',
    type: 'leave_approved',
    icon: Check,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
    title: 'Mark Rodriguez approved leave request from Alex Thompson',
    time: '15 minutes ago'
  },
  {
    id: '3',
    type: 'payroll_calculated',
    icon: FileText,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    title: 'Payroll cycle for January 2024 has been calculated',
    time: '1 hour ago'
  }
];

export default function RecentActivity() {
  return (
    <Card className="bg-white rounded-xl border border-gray-200" data-testid="recent-activity-card">
      <CardHeader className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900" data-testid="text-recent-activity-title">
            Recent Activity
          </CardTitle>
          <Button variant="ghost" className="text-primary text-sm font-medium hover:text-blue-700" data-testid="button-view-all-activity">
            View all
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-start space-x-3" data-testid={`activity-${activity.id}`}>
                <div className={`w-8 h-8 ${activity.iconBg} rounded-full flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${activity.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900" data-testid={`text-activity-title-${activity.id}`}>
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1" data-testid={`text-activity-time-${activity.id}`}>
                    {activity.time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
