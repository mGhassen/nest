import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code, TrendingUp, Palette } from "lucide-react";

const departments = [
  {
    id: 'engineering',
    name: 'Engineering',
    employees: 42,
    completion: 95,
    icon: Code,
    iconBg: 'bg-blue-500'
  },
  {
    id: 'marketing',
    name: 'Marketing',
    employees: 18,
    completion: 87,
    icon: TrendingUp,
    iconBg: 'bg-green-500'
  },
  {
    id: 'design',
    name: 'Design',
    employees: 12,
    completion: 92,
    icon: Palette,
    iconBg: 'bg-purple-500'
  }
];

export default function TeamOverview() {
  return (
    <Card className="bg-white rounded-xl border border-gray-200" data-testid="team-overview-card">
      <CardHeader className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900" data-testid="text-team-overview-title">
            Team Overview
          </CardTitle>
          <Button variant="ghost" className="text-primary text-sm font-medium hover:text-blue-700" data-testid="button-manage-teams">
            Manage
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {departments.map((dept) => {
            const Icon = dept.icon;
            return (
              <div key={dept.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg" data-testid={`department-${dept.id}`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${dept.iconBg} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900" data-testid={`text-dept-name-${dept.id}`}>
                      {dept.name}
                    </p>
                    <p className="text-sm text-gray-600" data-testid={`text-dept-employees-${dept.id}`}>
                      {dept.employees} employees
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900" data-testid={`text-dept-completion-${dept.id}`}>
                    {dept.completion}%
                  </p>
                  <p className="text-xs text-gray-500">Timesheet completion</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
