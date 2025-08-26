"use client"

import ProtectedRoute from "@/components/auth/protected-route"
import AdminLayout from "@/components/layout/admin-layout"
import EmployeeForm from "@/components/employees/employee-form"

export default function CreateEmployeePage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Create Employee</h2>
          </div>
          <EmployeeForm />
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}

