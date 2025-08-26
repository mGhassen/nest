import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Department {
  id: string;
  name: string;
  employeeCount: number;
  completionRate: number;
}

interface TeamOverviewProps {
  departments?: Department[];
}

export default function TeamOverview({ departments }: TeamOverviewProps) {
  const defaultDepartments: Department[] = [
    {
      id: "1",
      name: "Engineering",
      employeeCount: 12,
      completionRate: 85,
    },
    {
      id: "2",
      name: "Sales",
      employeeCount: 8,
      completionRate: 92,
    },
    {
      id: "3",
      name: "Marketing",
      employeeCount: 6,
      completionRate: 78,
    },
    {
      id: "4",
      name: "HR",
      employeeCount: 4,
      completionRate: 95,
    },
  ];

  const data = departments || defaultDepartments;

  return (
    <Card className="rounded-xl border" data-testid="team-overview-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground" data-testid="text-team-overview-title">
          Team Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.map((dept) => (
          <div key={dept.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground" data-testid={`text-dept-name-${dept.id}`}>
                  {dept.name}
                </p>
                <p className="text-sm text-muted-foreground" data-testid={`text-dept-employees-${dept.id}`}>
                  {dept.employeeCount} employees
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground" data-testid={`text-dept-completion-${dept.id}`}>
                  {dept.completionRate}%
                </p>
                <p className="text-xs text-muted-foreground">Timesheet completion</p>
              </div>
            </div>
            <Progress value={dept.completionRate} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
