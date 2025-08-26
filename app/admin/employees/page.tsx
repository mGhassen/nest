"use client"

import { useAuth } from "@/lib/auth/auth-context"
import { useEffect } from "react"
import { redirect } from "next/navigation"
import AdminLayout from "@/components/layout/admin-layout"
import { Button } from "@/components/ui/button"
import { Plus, Users, Search, Filter } from "lucide-react"
import Link from "next/link"
import EmployeeTable from "@/components/employees/employee-table"
import type { Employee } from "@/types/schema"

export default function AdminEmployeesPage() {
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      redirect("/auth/signin")
    }
    
    // Redirect non-admins to appropriate portal
    if (!isLoading && user && !["OWNER", "HR", "MANAGER"].includes(user.role)) {
      redirect("/employee/dashboard")
    }
  }, [user, isLoading])

  if (isLoading || !user) {
    return (
      <AdminLayout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading...</div>
          </div>
        </div>
      </AdminLayout>
    )
  }

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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search employees..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Employee List */}
        <EmployeeTable 
          employees={[]} 
          onEdit={(employee: Employee) => {
            // Handle edit - redirect to edit page
            window.location.href = `/admin/employees/${employee.id}`;
          }} 
          onDelete={(id: string) => {
            // Handle delete logic
            if (confirm('Are you sure you want to delete this employee?')) {
              console.log('Delete employee:', id);
              // TODO: Implement delete API call
            }
          }} 
        />
      </div>
    </AdminLayout>
  )
}
