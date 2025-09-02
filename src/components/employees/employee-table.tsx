import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Eye, Edit, Trash2, MoreVertical, Key, Mail, Archive, Ban, ExternalLink, User, UserX } from "lucide-react";
import Link from "next/link";
import type { Employee, Account } from "@/types/schema";

// Extended employee type that includes account information
type EmployeeWithAccount = Employee & {
  account?: Account | null;
};
import { usePeopleDelete, usePeopleUpdate, usePeoplePasswordManagement } from "@/hooks/use-people";
import { useToast } from "@/hooks/use-toast";
import SendInvitationDialog from "./send-invitation-dialog";
import PasswordManagementDialog from "./password-management-dialog";

interface EmployeeTableProps {
  employees: EmployeeWithAccount[];
  onEdit?: (employee: Employee) => void;
  onDelete?: (id: string) => void;
  onSetPassword?: (employee: Employee) => void;
  onResetPassword?: (employee: Employee) => void;
  onResendInvitation?: (employee: Employee) => void;
  onArchive?: (employee: Employee) => void;
  onSuspend?: (employee: Employee) => void;
  onSort?: (field: string) => void;
  getSortIcon?: (field: string) => React.ReactNode;
  sortField?: string;
  sortDirection?: "asc" | "desc";
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  selectedEmployees?: Set<string>;
  selectAll?: boolean;
  onSelectAll?: (checked: boolean) => void;
  onSelectEmployee?: (employeeId: string, checked: boolean) => void;
}

export default function EmployeeTable({ 
  employees, 
  onEdit, 
  onDelete, 
  onSetPassword, 
  onResetPassword, 
  onResendInvitation, 
  onArchive, 
  onSuspend,
  onSort,
  getSortIcon,
  sortField,
  sortDirection,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  selectedEmployees = new Set(),
  selectAll = false,
  onSelectAll,
  onSelectEmployee
}: EmployeeTableProps) {
  const { toast } = useToast();
  const deleteEmployee = usePeopleDelete();
  const updateEmployee = usePeopleUpdate();
  const passwordManagement = usePeoplePasswordManagement();
  const [invitationDialog, setInvitationDialog] = useState<{
    open: boolean;
    employee: Employee | null;
  }>({ open: false, employee: null });
  
  const [passwordDialog, setPasswordDialog] = useState<{
    open: boolean;
    employee: Employee | null;
  }>({ open: false, employee: null });
  
  // Default handlers if not provided
  const handleEdit = onEdit || ((employee: Employee) => {
    window.location.href = `/admin/people/${employee.id}`;
  });
  
  const handleDelete = onDelete || ((id: string) => {
    if (confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      deleteEmployee.mutate(id, {
        onSuccess: () => {
          toast({
            title: "Employee deleted",
            description: "The employee has been successfully deleted.",
          });
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to delete employee.",
            variant: "destructive",
          });
        },
      });
    }
  });

  const handleSetPassword = onSetPassword || ((employee: Employee) => {
    setPasswordDialog({ open: true, employee });
  });

  const handleResetPassword = onResetPassword || ((employee: Employee) => {
    if (confirm(`Send password reset email to ${employee.first_name} ${employee.last_name} (${employee.email})?`)) {
      passwordManagement.mutate(
        { id: employee.id, action: 'reset' },
        {
          onSuccess: () => {
            toast({
              title: "Password reset email sent",
              description: `A password reset email has been sent to ${employee.email}`,
            });
          },
          onError: (error) => {
            toast({
              title: "Error",
              description: error.message || "Failed to send password reset email",
              variant: "destructive",
            });
          },
        }
      );
    }
  });

  const handleResendInvitation = onResendInvitation || ((employee: Employee) => {
    setInvitationDialog({ open: true, employee });
  });

  const handleArchive = onArchive || ((employee: Employee) => {
    if (confirm(`Are you sure you want to archive ${employee.first_name} ${employee.last_name}?`)) {
      updateEmployee.mutate({
        id: employee.id,
        data: { status: 'INACTIVE' }
      }, {
        onSuccess: () => {
          toast({
            title: "Employee archived",
            description: `${employee.first_name} ${employee.last_name} has been archived.`,
          });
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to archive employee.",
            variant: "destructive",
          });
        },
      });
    }
  });

  const handleSuspend = onSuspend || ((employee: Employee) => {
    if (confirm(`Are you sure you want to suspend ${employee.first_name} ${employee.last_name}?`)) {
      updateEmployee.mutate({
        id: employee.id,
        data: { status: 'ON_LEAVE' }
      }, {
        onSuccess: () => {
          toast({
            title: "Employee suspended",
            description: `${employee.first_name} ${employee.last_name} has been suspended.`,
          });
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to suspend employee.",
            variant: "destructive",
          });
        },
      });
    }
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
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide w-12">
                {onSelectAll && (
                  <Checkbox
                    checked={selectAll}
                    onCheckedChange={onSelectAll}
                    aria-label="Select all employees"
                  />
                )}
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <button
                  onClick={() => onSort?.('first_name')}
                  className="flex items-center space-x-1 hover:text-foreground transition-colors"
                >
                  <span>Person</span>
                  {getSortIcon?.('first_name')}
                </button>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <button
                  onClick={() => onSort?.('position_title')}
                  className="flex items-center space-x-1 hover:text-foreground transition-colors"
                >
                  <span>Group</span>
                  {getSortIcon?.('position_title')}
                </button>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <button
                  onClick={() => onSort?.('employment_type')}
                  className="flex items-center space-x-1 hover:text-foreground transition-colors"
                >
                  <span>Worker type</span>
                  {getSortIcon?.('employment_type')}
                </button>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <button
                  onClick={() => onSort?.('status')}
                  className="flex items-center space-x-1 hover:text-foreground transition-colors"
                >
                  <span>Worker status</span>
                  {getSortIcon?.('status')}
                </button>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <button
                  onClick={() => onSort?.('hire_date')}
                  className="flex items-center space-x-1 hover:text-foreground transition-colors"
                >
                  <span>Hire Date</span>
                  {getSortIcon?.('hire_date')}
                </button>
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
                <td className="px-6 py-4 whitespace-nowrap w-12">
                  {onSelectEmployee && (
                    <Checkbox
                      checked={selectedEmployees.has(employee.id)}
                      onCheckedChange={(checked) => onSelectEmployee(employee.id, checked as boolean)}
                      aria-label={`Select ${employee.first_name} ${employee.last_name}`}
                    />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm" data-testid={`text-employee-initials-${employee.id}`}>
                        {getInitials(employee.first_name, employee.last_name)}
                      </span>
                    </div>
                    <div className="ml-3">
                      <div className="flex items-center space-x-1">
                        {employee.account ? (
                          <>
                            <Link href={`/admin/people/${employee.id}`} className="hover:underline">
                              <div className="text-sm font-medium text-blue-600" data-testid={`text-employee-name-${employee.id}`}>
                                {employee.first_name} {employee.last_name}
                              </div>
                            </Link>
                            <Link href={`/admin/people/${employee.id}?tab=account`} className="text-blue-600 hover:text-blue-800">
                              <User className="w-3 h-3" />
                            </Link>
                          </>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <div className="text-sm font-medium text-gray-600" data-testid={`text-employee-name-${employee.id}`}>
                              {employee.first_name} {employee.last_name}
                            </div>
                            <UserX className="w-3 h-3 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground" data-testid={`text-employee-email-${employee.id}`}>
                        {employee.email}
                      </div>
                      {employee.account && (
                        <div className="text-xs text-muted-foreground mt-1">
                          <span className="font-medium">Account: {employee.account.role}</span>
                        </div>
                      )}
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
                  {getStatusBadge(employee.status || 'ACTIVE')}
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
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} results
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              disabled={currentPage <= 1}
              onClick={() => onPageChange?.(currentPage - 1)}
              data-testid="button-previous-page"
            >
              Previous
            </Button>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onPageChange?.(pageNum)}
                  data-testid={`button-page-${pageNum}`}
                >
                  {pageNum}
                </Button>
              );
            })}
            
            <Button 
              variant="ghost" 
              size="sm" 
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange?.(currentPage + 1)}
              data-testid="button-next-page"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Send Invitation Dialog */}
      <SendInvitationDialog
        employee={invitationDialog.employee}
        open={invitationDialog.open}
        onOpenChange={(open) => setInvitationDialog({ open, employee: null })}
        onSuccess={() => {
          // Refresh the data or show success message
          toast({
            title: "Success",
            description: "Employee data will be refreshed automatically.",
          });
        }}
      />

      {/* Password Management Dialog */}
      <PasswordManagementDialog
        employeeId={passwordDialog.employee?.id || ''}
        employeeName={passwordDialog.employee ? `${passwordDialog.employee.first_name} ${passwordDialog.employee.last_name}` : ''}
        open={passwordDialog.open}
        onOpenChange={(open) => setPasswordDialog({ open, employee: null })}
        onSuccess={() => {
          // Refresh the data or show success message
          toast({
            title: "Success",
            description: "Password updated successfully.",
          });
        }}
      />
    </div>
  );
}
