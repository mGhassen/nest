"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import AdminLayout from "@/components/layout/admin-layout"
import { Button } from "@/components/ui/button"
import { Plus, Search, Filter, X, ArrowUpDown, ArrowUp, ArrowDown, Trash2, Archive, Ban } from "lucide-react"
import Link from "next/link"
import EmployeeTable from "@/components/employees/employee-table"
import { usePeopleList } from "@/hooks/use-people"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { usePeopleDelete, usePeopleUpdate } from "@/hooks/use-people"
import { useToast } from "@/hooks/use-toast"
import { LoadingPage } from "@/components/ui/loading-spinner"

export default function PeopleListPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState<string>("")
  const [showFilters, setShowFilters] = useState(false)
  const [sortField, setSortField] = useState<string>("")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(false)

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/auth/login");
    } else if (!user.isAdmin) {
      router.replace("/unauthorized");
    }
  }, [user, isLoading, router]);

  // Fetch people using custom hook
  const { data: people = [], isLoading: loadingPeople } = usePeopleList();
  const { toast } = useToast();
  const deleteEmployee = usePeopleDelete();
  const updateEmployee = usePeopleUpdate();
  
  // Filter and sort people
  const filteredAndSortedPeople = people
    .filter((person) => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = (
          person.first_name?.toLowerCase().includes(query) ||
          person.last_name?.toLowerCase().includes(query) ||
          person.email?.toLowerCase().includes(query) ||
          person.position_title?.toLowerCase().includes(query) ||
          `${person.first_name} ${person.last_name}`.toLowerCase().includes(query)
        );
        if (!matchesSearch) return false;
      }
      
      // Status filter
      if (statusFilter && person.status !== statusFilter) {
        return false;
      }
      
      // Employment type filter
      if (employmentTypeFilter && person.employment_type !== employmentTypeFilter) {
        return false;
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
      
      // Handle date fields
      if (sortField === "hire_date") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
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

  // Pagination logic
  const totalItems = filteredAndSortedPeople.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedPeople = filteredAndSortedPeople.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, employmentTypeFilter, sortField, sortDirection]);

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
    setStatusFilter("");
    setEmploymentTypeFilter("");
    setSortField("");
    setSortDirection("asc");
    setCurrentPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery || statusFilter || employmentTypeFilter || sortField;

  // Bulk selection handlers
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedEmployees(new Set(paginatedPeople.map(emp => emp.id)));
    } else {
      setSelectedEmployees(new Set());
    }
  };

  const handleSelectEmployee = (employeeId: string, checked: boolean) => {
    const newSelected = new Set(selectedEmployees);
    if (checked) {
      newSelected.add(employeeId);
    } else {
      newSelected.delete(employeeId);
    }
    setSelectedEmployees(newSelected);
    setSelectAll(newSelected.size === paginatedPeople.length && paginatedPeople.length > 0);
  };

  // Bulk action handlers
  const handleBulkDelete = () => {
    if (selectedEmployees.size === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedEmployees.size} employee(s)? This action cannot be undone.`)) {
      const deletePromises = Array.from(selectedEmployees).map(id => 
        deleteEmployee.mutateAsync(id)
      );
      
      Promise.all(deletePromises)
        .then(() => {
          toast({
            title: "Employees deleted",
            description: `${selectedEmployees.size} employee(s) have been successfully deleted.`,
          });
          setSelectedEmployees(new Set());
          setSelectAll(false);
        })
        .catch((error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to delete some employees.",
            variant: "destructive",
          });
        });
    }
  };

  const handleBulkArchive = () => {
    if (selectedEmployees.size === 0) return;
    
    if (confirm(`Are you sure you want to archive ${selectedEmployees.size} employee(s)?`)) {
      const updatePromises = Array.from(selectedEmployees).map(id => 
        updateEmployee.mutateAsync({ id, data: { status: 'INACTIVE' } })
      );
      
      Promise.all(updatePromises)
        .then(() => {
          toast({
            title: "Employees archived",
            description: `${selectedEmployees.size} employee(s) have been successfully archived.`,
          });
          setSelectedEmployees(new Set());
          setSelectAll(false);
        })
        .catch((error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to archive some employees.",
            variant: "destructive",
          });
        });
    }
  };

  const handleBulkSuspend = () => {
    if (selectedEmployees.size === 0) return;
    
    if (confirm(`Are you sure you want to suspend ${selectedEmployees.size} employee(s)?`)) {
      const updatePromises = Array.from(selectedEmployees).map(id => 
        updateEmployee.mutateAsync({ id, data: { status: 'ON_LEAVE' } })
      );
      
      Promise.all(updatePromises)
        .then(() => {
          toast({
            title: "Employees suspended",
            description: `${selectedEmployees.size} employee(s) have been successfully suspended.`,
          });
          setSelectedEmployees(new Set());
          setSelectAll(false);
        })
        .catch((error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to suspend some employees.",
            variant: "destructive",
          });
        });
    }
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Employee Directory</h2>
            <p className="text-muted-foreground">
              Manage and view all employees in your organization
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filter
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {[searchQuery, statusFilter, employmentTypeFilter].filter(Boolean).length}
                </Badge>
              )}
            </Button>
            <Link href="/admin/people/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Search and Filter Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search people..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-4 py-2 w-full border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-sm text-muted-foreground">
                {hasActiveFilters ? (
                  <>
                    {filteredAndSortedPeople.length} of {people.length} employees
                  </>
                ) : (
                  <>
                    {people.length} employees
                  </>
                )}
              </div>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8 px-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="rounded-lg border bg-card p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="TERMINATED">Terminated</SelectItem>
                      <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Employment Type</label>
                  <Select value={employmentTypeFilter} onValueChange={setEmploymentTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All types</SelectItem>
                      <SelectItem value="FULL_TIME">Full Time</SelectItem>
                      <SelectItem value="PART_TIME">Part Time</SelectItem>
                      <SelectItem value="CONTRACTOR">Contractor</SelectItem>
                      <SelectItem value="INTERN">Intern</SelectItem>
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
        </div>

        {/* Bulk Actions Bar */}
        {selectedEmployees.size > 0 && (
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">
                  {selectedEmployees.size} employee(s) selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedEmployees(new Set());
                    setSelectAll(false);
                  }}
                  className="h-8 px-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkArchive}
                  className="h-8"
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkSuspend}
                  className="h-8"
                >
                  <Ban className="mr-2 h-4 w-4" />
                  Suspend
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="h-8"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-md border">
          {loadingPeople ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-lg">Loading people...</div>
            </div>
          ) : (
            <EmployeeTable 
              employees={paginatedPeople}
              onSort={handleSort}
              getSortIcon={getSortIcon}
              sortField={sortField}
              sortDirection={sortDirection}
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              selectedEmployees={selectedEmployees}
              selectAll={selectAll}
              onSelectAll={handleSelectAll}
              onSelectEmployee={handleSelectEmployee}
            />
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
