import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, User, FileText, Calendar } from "lucide-react";

interface Activity {
  id: string;
  type: "timesheet" | "leave" | "document" | "profile";
  title: string;
  description: string;
  time: string;
  user: string;
}

interface RecentActivityProps {
  activities?: Activity[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  const defaultActivities: Activity[] = [
    {
      id: "1",
      type: "timesheet",
      title: "Timesheet submitted",
      description: "Weekly timesheet for Engineering team",
      time: "2 hours ago",
      user: "John Doe",
    },
    {
      id: "2",
      type: "leave",
      title: "Leave request approved",
      description: "Annual leave for next week",
      time: "4 hours ago",
      user: "Jane Smith",
    },
    {
      id: "3",
      type: "document",
      title: "Document uploaded",
      description: "New employee handbook",
      time: "6 hours ago",
      user: "HR Team",
    },
    {
      id: "4",
      type: "profile",
      title: "Profile updated",
      description: "Contact information changed",
      time: "1 day ago",
      user: "Mike Johnson",
    },
  ];

  const data = activities || defaultActivities;

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "timesheet":
        return <Clock className="w-4 h-4" />;
      case "leave":
        return <Calendar className="w-4 h-4" />;
      case "document":
        return <FileText className="w-4 h-4" />;
      case "profile":
        return <User className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: Activity["type"]) => {
    switch (type) {
      case "timesheet":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400";
      case "leave":
        return "bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400";
      case "document":
        return "bg-purple-100 text-purple-800 dark:bg-purple-950/20 dark:text-purple-400";
      case "profile":
        return "bg-orange-100 text-orange-800 dark:bg-orange-950/20 dark:text-orange-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-950/20 dark:text-gray-400";
    }
  };

  return (
    <Card className="rounded-xl border" data-testid="recent-activity-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground" data-testid="text-recent-activity-title">
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground" data-testid={`text-activity-title-${activity.id}`}>
                {activity.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1" data-testid={`text-activity-time-${activity.id}`}>
                {activity.time} • {activity.user}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
