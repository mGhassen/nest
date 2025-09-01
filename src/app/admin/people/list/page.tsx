"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import AdminLayout from "@/components/layout/admin-layout"
import { Button } from "@/components/ui/button"
import { Plus, Search, Filter } from "lucide-react"
import Link from "next/link"
import EmployeeTable from "@/components/employees/employee-table"
import type { Employee } from "@/types/schema"

export default function PeopleListPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/auth/login");
    } else if (!user.isAdmin) {
      router.replace("/unauthorized");
    }
  }, [user, isLoading, router]);

  // Fetch employees when component mounts
  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    setLoadingEmployees(true)
    try {
      // Get the access token from localStorage
      const token = localStorage.getItem('access_token')
      if (!token) {
        console.error('No access token found')
        return
      }

      const response = await fetch('/api/employees', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setEmployees(data.employees || [])
      } else {
        console.error('Failed to fetch employees:', response.status)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoadingEmployees(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-lg text-muted-foreground">Loading...</span>
      </div>
    );
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
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Link href="/admin/people/list/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-4 py-2 w-full border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <EmployeeTable 
            employees={employees} 
            loading={loadingEmployees}
            onRefresh={fetchEmployees}
          />
        </div>
      </div>
    </AdminLayout>
  );
}
