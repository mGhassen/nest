import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Eye, Edit, Trash2, MoreVertical, Key, Mail, Archive, Ban } from "lucide-react";
import Link from "next/link";
import type { Employee } from "@/types/schema";

interface EmployeeTableProps {
  employees: Employee[];
  onEdit?: (employee: Employee) => void;
  onDelete?: (id: string) => void;
  onSetPassword?: (employee: Employee) => void;
  onResetPassword?: (employee: Employee) => void;
  onResendInvitation?: (employee: Employee) => void;
  onArchive?: (employee: Employee) => void;
  onSuspend?: (employee: Employee) => void;
}

export default function EmployeeTable({ 
  employees, 
  onEdit, 
  onDelete, 
  onSetPassword, 
  onResetPassword, 
  onResendInvitation, 
  onArchive, 
  onSuspend 
}: EmployeeTableProps) {
  // Default handlers if not provided
  const handleEdit = onEdit || ((employee: Employee) => {
    window.location.href = `/admin/people/${employee.id}`;
  });
  
  const handleDelete = onDelete || ((id: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      // Default delete behavior - could be enhanced later
      console.log('Delete employee:', id);
    }
  });

  const handleSetPassword = onSetPassword || ((employee: Employee) => {
    console.log('Set password for:', employee.email);
  });

  const handleResetPassword = onResetPassword || ((employee: Employee) => {
    console.log('Reset password for:', employee.email);
  });

  const handleResendInvitation = onResendInvitation || ((employee: Employee) => {
    console.log('Resend invitation for:', employee.email);
  });

  const handleArchive = onArchive || ((employee: Employee) => {
    console.log('Archive employee:', employee.email);
  });

  const handleSuspend = onSuspend || ((employee: Employee) => {
    console.log('Suspend employee:', employee.email);
  });
  const getInitials = (firstName: string | null, lastName: string | null) => {
    if (!firstName || !lastName) return '??';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'ACTIVE': 'bg-green-100 text-green-800',
      'INACTIVE': 'bg-gray-100 text-gray-800',
      'TERMINATED': 'bg-red-100 text-red-800',
      'ON_LEAVE': 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };



  if (employees.length === 0) {
    return (
      <div className="rounded-xl border">
        <div className="p-8 text-center">
          <div className="text-muted-foreground mb-4">
            <Eye className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No employees found</h3>
          <p className="text-muted-foreground">Get started by adding your first employee.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg" data-testid="employee-table">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Person
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Group
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Worker type
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Worker status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Hire Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Worker ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-background divide-y divide-border">
            {employees.map((employee) => (
              <tr key={employee.id} className="hover:bg-muted/50" data-testid={`employee-row-${employee.id}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm" data-testid={`text-employee-initials-${employee.id}`}>
                        {getInitials(employee.first_name, employee.last_name)}
                      </span>
                    </div>
                    <div className="ml-3">
                      <Link href={`/admin/people/${employee.id}`} className="hover:underline">
                        <div className="text-sm font-medium text-blue-600" data-testid={`text-employee-name-${employee.id}`}>
                          {employee.first_name} {employee.last_name}
                        </div>
                      </Link>
                      <div className="text-xs text-muted-foreground" data-testid={`text-employee-email-${employee.id}`}>
                        {employee.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap" data-testid={`text-employee-position-${employee.id}`}>
                  <div className="text-sm text-foreground">{employee.position_title || 'Engineering'}</div>
                  <div className="text-xs text-muted-foreground">Wayne Enterprise Global</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground" data-testid={`text-employee-type-${employee.id}`}>
                  {employee.employment_type || 'Contractor'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap" data-testid={`badge-employee-status-${employee.id}`}>
                  {getStatusBadge(employee.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap" data-testid={`text-employee-hire-date-${employee.id}`}>
                  <div className="text-sm text-foreground">
                    {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    }) : 'Not set'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {employee.id?.slice(0, 3).toUpperCase() || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleEdit(employee)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem onClick={() => handleSetPassword(employee)}>
                        <Key className="mr-2 h-4 w-4" />
                        Set Password
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem onClick={() => handleResetPassword(employee)}>
                        <Key className="mr-2 h-4 w-4" />
                        Reset Password
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem onClick={() => handleResendInvitation(employee)}>
                        <Mail className="mr-2 h-4 w-4" />
                        Resend Invitation
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem onClick={() => handleArchive(employee)}>
                        <Archive className="mr-2 h-4 w-4" />
                        Archive
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem onClick={() => handleSuspend(employee)}>
                        <Ban className="mr-2 h-4 w-4" />
                        Suspend
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem 
                        onClick={() => handleDelete(employee.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="px-6 py-4 border-t">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground" data-testid="text-pagination-info">
            Showing 1 to {employees.length} of {employees.length} results
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" disabled data-testid="button-previous-page">
              Previous
            </Button>
            <Button variant="default" size="sm" data-testid="button-page-1">
              1
            </Button>
            <Button variant="ghost" size="sm" disabled data-testid="button-next-page">
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
