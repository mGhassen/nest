import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import type { Employee } from "@/types/schema";

interface EmployeeTableProps {
  employees: Employee[];
  onEdit?: (employee: Employee) => void;
  onDelete?: (id: string) => void;
}

export default function EmployeeTable({ employees, onEdit, onDelete }: EmployeeTableProps) {
  // Default handlers if not provided
  const handleEdit = onEdit || ((employee: Employee) => {
    window.location.href = `/admin/employees/${employee.id}`;
  });
  
  const handleDelete = onDelete || ((id: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      // Default delete behavior - could be enhanced later
      console.log('Delete employee:', id);
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

  const formatSalary = (baseSalary: string | null, salaryPeriod: string | null) => {
    if (!baseSalary) return 'Not set';
    const amount = parseFloat(baseSalary);
    const period = salaryPeriod === 'YEARLY' ? '/year' : '/month';
    return `€${amount.toLocaleString()}${period}`;
  };

  if (employees.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <Eye className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
          <p className="text-gray-600">Get started by adding your first employee.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg" data-testid="employee-table">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                Person
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                Group
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                Worker type
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                Worker status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                Hire Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                Worker ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {employees.map((employee) => (
              <tr key={employee.id} className="hover:bg-gray-50" data-testid={`employee-row-${employee.id}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm" data-testid={`text-employee-initials-${employee.id}`}>
                        {getInitials(employee.first_name, employee.last_name)}
                      </span>
                    </div>
                    <div className="ml-3">
                      <Link href={`/employees/${employee.id}`} className="hover:underline">
                        <div className="text-sm font-medium text-blue-600" data-testid={`text-employee-name-${employee.id}`}>
                          {employee.first_name} {employee.last_name}
                        </div>
                      </Link>
                      <div className="text-xs text-gray-500" data-testid={`text-employee-email-${employee.id}`}>
                        {employee.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap" data-testid={`text-employee-position-${employee.id}`}>
                  <div className="text-sm text-gray-900">{employee.position_title || 'Engineering'}</div>
                  <div className="text-xs text-gray-500">Wayne Enterprise Global</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" data-testid={`text-employee-type-${employee.id}`}>
                  {employee.employment_type || 'Contractor'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap" data-testid={`badge-employee-status-${employee.id}`}>
                  {getStatusBadge(employee.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap" data-testid={`text-employee-hire-date-${employee.id}`}>
                  <div className="text-sm text-gray-900">
                    {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    }) : 'Not set'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {employee.id?.slice(0, 3).toUpperCase() || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center space-x-2">
                    <Link href={`/admin/employees/${employee.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit(employee)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(employee.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500" data-testid="text-pagination-info">
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
