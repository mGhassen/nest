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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, Edit, Trash2, MoreVertical, Building2, Globe, Users, Calendar } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

interface Company {
  company_id: string;
  company_name: string;
  role: string;
  created_at: string;
  // Add other company fields as needed
}

interface CompanyTableProps {
  companies: Company[];
  onEdit?: (company: Company) => void;
  onDelete?: (id: string) => void;
  onView?: (company: Company) => void;
  onSort?: (field: string) => void;
  getSortIcon?: (field: string) => React.ReactNode;
  sortField?: string;
  sortDirection?: "asc" | "desc";
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  selectedCompanies?: Set<string>;
  selectAll?: boolean;
  onSelectAll?: (checked: boolean) => void;
  onSelectCompany?: (companyId: string, checked: boolean) => void;
}

export default function CompanyTable({ 
  companies, 
  onEdit, 
  onDelete, 
  onView,
  onSort,
  getSortIcon,
  sortField,
  sortDirection,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  selectedCompanies = new Set(),
  selectAll = false,
  onSelectAll,
  onSelectCompany
}: CompanyTableProps) {
  const { toast } = useToast();
  
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    company: Company | null;
  }>({ open: false, company: null });
  
  // Default handlers if not provided
  const handleView = onView || ((company: Company) => {
    window.location.href = `/admin/companies/${company.company_id}`;
  });
  
  const handleEdit = onEdit || ((company: Company) => {
    // Navigate to edit page or open edit dialog
    console.log('Edit company:', company);
  });
  
  const handleDelete = onDelete || ((id: string) => {
    const company = companies.find(comp => comp.company_id === id);
    if (company) {
      setDeleteDialog({ open: true, company });
    }
  });

  const confirmDelete = async () => {
    if (deleteDialog.company) {
      try {
        // Call delete API here
        console.log('Deleting company:', deleteDialog.company.company_id);
        toast({
          title: "Company deleted",
          description: `${deleteDialog.company.company_name} has been deleted.`,
        });
        setDeleteDialog({ open: false, company: null });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete company",
          variant: "destructive",
        });
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'default';
      case 'EMPLOYEE':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  <Checkbox
                    checked={selectAll}
                    onCheckedChange={onSelectAll}
                    className="mr-2"
                  />
                  Company
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 lg:px-3"
                    onClick={() => onSort?.('role')}
                  >
                    Role
                    {getSortIcon?.('role')}
                  </Button>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 lg:px-3"
                    onClick={() => onSort?.('created_at')}
                  >
                    Created
                    {getSortIcon?.('created_at')}
                  </Button>
                </th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.company_id} className="border-b transition-colors hover:bg-muted/50">
                  <td className="p-4 align-middle">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={selectedCompanies.has(company.company_id)}
                        onCheckedChange={(checked) => onSelectCompany?.(company.company_id, checked as boolean)}
                        className="mr-2"
                      />
                      <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">{company.company_name}</div>
                        <div className="text-sm text-muted-foreground">
                          Company ID: {company.company_id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    <Badge variant={getRoleBadgeVariant(company.role)}>
                      {company.role}
                    </Badge>
                  </td>
                  <td className="p-4 align-middle text-sm text-muted-foreground">
                    {formatDate(company.created_at)}
                  </td>
                  <td className="p-4 align-middle text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(company)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(company)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Company
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(company.company_id)}
                          className="text-destructive focus:text-destructive"
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
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} companies
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange?.(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, company: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Company</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteDialog.company?.company_name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, company: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
