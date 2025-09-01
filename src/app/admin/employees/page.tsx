"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/admin-layout"
import { Button } from "@/components/ui/button"
import { Plus, Search, Filter } from "lucide-react"
import Link from "next/link"
import EmployeeTable from "@/components/employees/employee-table"
import type { Employee } from "@/types/schema"

export default function AdminEmployeesPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/auth/login");
    } else if (!user.isAdmin) {
      router.replace("/unauthorized");
    }
  }, [user, isLoading, router]);

  // Fetch employees using React Query
  const { data: employees = [], isLoading: loadingEmployees, error } = useQuery<Employee[]>({
    queryKey: ['/api/employees'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await fetch('/api/employees', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      
      const data = await response.json();
      return data.employees || [];
    },
    enabled: !!user && user.isAdmin,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-lg text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (!user || !user.isAdmin) return null;

  return (
    <AdminLayout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Employees</h2>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button asChild>
                <Link href="/admin/employees/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Employee
                </Link>
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                data-testid="input-search-employees"
              />
            </div>
          </div>

          {/* Employee List */}
          {loadingEmployees ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-lg">Loading employees...</div>
            </div>
          ) : (
            <EmployeeTable employees={employees} />
          )}
        </div>
    </AdminLayout>
  );
}
