"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { 
  Building2, 
  Plus, 
  Search,
  Filter,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useUserCompanies } from "@/hooks/use-companies";
import { useAuth } from "@/hooks/use-auth";
import AdminLayout from "@/components/layout/admin-layout";
import { LoadingPage } from "@/components/ui/loading-spinner";

export default function CompaniesPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { data: companies, isLoading: companiesLoading, error } = useUserCompanies();

  // Check if user is authenticated and is a superuser
  React.useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/auth/login");
    } else if (user.role !== 'SUPERUSER') {
      router.replace("/unauthorized");
    }
  }, [user, isLoading, router]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const handleCreateCompany = () => {
    router.push("/admin/settings/companies/create");
  };

  // Filter and sort companies
  const filteredCompanies = React.useMemo(() => {
    if (!companies) return [];
    
    return companies
      .filter((company) => {
        // Search filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchesSearch = (
            company.company_name?.toLowerCase().includes(query) ||
            company.company_id?.toLowerCase().includes(query)
          );
          if (!matchesSearch) return false;
        }
        
        // Role filter (based on is_admin)
        if (roleFilter) {
          const isAdmin = company.is_admin;
          const matchesRole = roleFilter === 'ADMIN' ? isAdmin : !isAdmin;
          if (!matchesRole) return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        if (!sortField) return 0;
        
        let aValue: any = a[sortField as keyof typeof a];
        let bValue: any = b[sortField as keyof typeof b];
        
        // Handle null/undefined values
        if (aValue == null) aValue = "";
        if (bValue == null) bValue = "";
        
        // Handle string fields
        if (typeof aValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (sortDirection === "asc") {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
  }, [companies, searchQuery, roleFilter, sortField, sortDirection]);

  // Pagination logic
  const totalItems = filteredCompanies.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCompanies = filteredCompanies.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, sortField, sortDirection]);

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Get sort icon for a field
  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setRoleFilter("");
    setSortField("");
    setSortDirection("asc");
    setCurrentPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery || roleFilter || sortField;

  // Bulk selection handlers
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedCompanies(new Set(paginatedCompanies.map((company) => company.company_id)));
    } else {
      setSelectedCompanies(new Set());
    }
  };

  const handleSelectCompany = (companyId: string, checked: boolean) => {
    const newSelected = new Set(selectedCompanies);
    if (checked) {
      newSelected.add(companyId);
    } else {
      newSelected.delete(companyId);
    }
    setSelectedCompanies(newSelected);
    setSelectAll(newSelected.size === paginatedCompanies.length && paginatedCompanies.length > 0);
  };

  if (isLoading || companiesLoading) {
    return <LoadingPage />;
  }

  // Don't render if user is not authenticated or not a superuser
  if (!user || user.role !== 'SUPERUSER') {
    return <LoadingPage />;
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-destructive mb-2">Error Loading Companies</h3>
            <p className="text-muted-foreground mb-4">
              {error.message || "Failed to load companies"}
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Companies</h1>
            <p className="text-muted-foreground mt-1">
              Manage your companies and access their settings
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="gap-2">
              <Building2 className="h-4 w-4" />
              {companies?.length || 0} Companies
            </Badge>
            <Button onClick={handleCreateCompany}>
              <Plus className="mr-2 h-4 w-4" />
              Create Company
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {showFilters && <X className="ml-2 h-4 w-4" />}
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-muted/50 p-4 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Role</label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All roles</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="EMPLOYEE">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Page Size</label>
                <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 per page</SelectItem>
                    <SelectItem value="10">10 per page</SelectItem>
                    <SelectItem value="25">25 per page</SelectItem>
                    <SelectItem value="50">50 per page</SelectItem>
                    <SelectItem value="100">100 per page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Companies Table */}
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide w-12">
                    <Checkbox
                      checked={selectAll}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    <button
                      className="flex items-center space-x-1 hover:text-foreground transition-colors"
                      onClick={() => handleSort('company_name')}
                    >
                      <span>Company</span>
                      {getSortIcon('company_name')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    <button
                      className="flex items-center space-x-1 hover:text-foreground transition-colors"
                      onClick={() => handleSort('is_admin')}
                    >
                      <span>Role</span>
                      {getSortIcon('is_admin')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                {paginatedCompanies.map((company) => (
                  <tr key={company.company_id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Checkbox
                        checked={selectedCompanies.has(company.company_id)}
                        onCheckedChange={(checked) => handleSelectCompany(company.company_id, checked as boolean)}
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {company.company_name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ID: {company.company_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant={company.is_admin ? 'default' : 'secondary'}>
                        {company.is_admin ? 'Admin' : 'Employee'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/settings/companies/${company.company_id}`)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} companies
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
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
                      onClick={() => setCurrentPage(page)}
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
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
