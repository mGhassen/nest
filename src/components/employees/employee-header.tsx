import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import Link from "next/link";
import type { Employee } from "@/types/employee";

interface EmployeeHeaderProps {
  employee: Employee;
  onEditEmployee?: () => void;
  onViewProfile?: () => void;
}

export default function EmployeeHeader({ 
  employee,
  onEditEmployee,
  onViewProfile
}: EmployeeHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/people/list">
            ← Back to People
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {employee.firstName} {employee.lastName}
          </h1>
          <p className="text-muted-foreground">{employee.position} • {employee.department}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
          {employee.status}
        </Badge>
        <Button variant="outline" size="sm" onClick={onViewProfile}>
          <Eye className="mr-2 h-4 w-4" />
          View Profile
        </Button>
        <Button size="sm" onClick={onEditEmployee}>
          Edit Employee
        </Button>
      </div>
    </div>
  );
}
