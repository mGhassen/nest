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

export default function CompaniesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { data: companies, isLoading, error } = useUserCompanies();

  // Check if user is authenticated and is a superuser
  React.useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/auth/login");
    } else if (user.role !== 'SUPERUSER') {
      router.replace("/unauthorized");
    }
  }, [user, authLoading, router]);
  
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
    
    let filtered = companies.filter(company => {
      const matchesSearch = company.company_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = !roleFilter || (roleFilter === 'ADMIN' ? company.is_admin : !company.is_admin);
      return matchesSearch && matchesRole;
    });

    if (sortField) {
      filtered.sort((a, b) => {
        const aValue = a[sortField as keyof typeof a];
        const bValue = b[sortField as keyof typeof b];
        
        // Handle undefined values
        if (aValue === undefined && bValue === undefined) return 0;
        if (aValue === undefined) return sortDirection === "asc" ? -1 : 1;
        if (bValue === undefined) return sortDirection === "asc" ? 1 : -1;
        
        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [companies, searchQuery, roleFilter, sortField, sortDirection]);

  // Loading and authentication checks
  if (authLoading || isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Loading Companies...</h3>
            <p className="text-muted-foreground">Please wait while we load your companies.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Don't render if user is not authenticated or not a superuser
  if (!user || user.role !== 'SUPERUSER') {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-destructive mb-2">Access Denied</h3>
            <p className="text-muted-foreground">You need superuser privileges to access this page.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Pagination
  const totalPages = Math.ceil(filteredCompanies.length / pageSize);
  const paginatedCompanies = filteredCompanies.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortDirection === "asc" ? 
      <ArrowUp className="ml-2 h-4 w-4" /> : 
      <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedCompanies(new Set(paginatedCompanies.map(company => company.company_id)));
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
    setSelectAll(newSelected.size === paginatedCompanies.length);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-destructive mb-2">Error Loading Companies</h3>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : "Failed to load companies"}
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
            <h1 className="text-3xl font-bold">Companies Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage your companies and access their settings
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-muted-foreground">Settings</span>
              <span className="text-muted-foreground">›</span>
              <span className="text-sm font-medium text-foreground">Companies</span>
            </div>
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
                    <SelectItem value="10">10 per page</SelectItem>
                    <SelectItem value="25">25 per page</SelectItem>
                    <SelectItem value="50">50 per page</SelectItem>
                    <SelectItem value="100">100 per page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setRoleFilter("");
                  setSortField("");
                  setSortDirection("asc");
                  setCurrentPage(1);
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}

        {/* Companies Table */}
        {!companies || companies.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Companies Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || roleFilter 
                ? "No companies match your current filters." 
                : "You don't have access to any companies yet."}
            </p>
            <Button onClick={handleCreateCompany} size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Create Your First Company
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
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
                        <span>Company Name</span>
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
                <tbody className="divide-y divide-border">
                  {paginatedCompanies.map((company) => (
                    <tr key={company.company_id} className="hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedCompanies.has(company.company_id)}
                          onCheckedChange={(checked) => handleSelectCompany(company.company_id, checked as boolean)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">{company.company_name}</div>
                            <div className="text-xs text-muted-foreground">ID: {company.company_id}</div>
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
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t bg-muted/25 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredCompanies.length)} of {filteredCompanies.length} companies
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bulk Actions */}
        {selectedCompanies.size > 0 && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium">
                  {selectedCompanies.size} company{selectedCompanies.size !== 1 ? 'ies' : ''} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  Export Selected
                </Button>
                <Button variant="destructive" size="sm">
                  Delete Selected
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}