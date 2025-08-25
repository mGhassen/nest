"use client"

import MainLayout from "@/components/layout/main-layout"
import EmployeeTable from "@/components/employees/employee-table"
import { useState } from "react"

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([])

  const handleEdit = (employee: any) => {
    // Handle edit logic
    console.log('Edit employee:', employee)
  }

  const handleDelete = (id: string) => {
    // Handle delete logic
    console.log('Delete employee:', id)
  }

  return (
    <MainLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Employees</h2>
        </div>
        <EmployeeTable 
          employees={employees} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
      </div>
    </MainLayout>
  )
}
