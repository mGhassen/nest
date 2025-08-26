"use client"

import ProtectedRoute from "@/components/auth/protected-route"
import AdminLayout from "@/components/layout/admin-layout"
import { Button } from "@/components/ui/button"

export default function PayrollPage() {

  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Payroll</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-4">
            <div className="rounded-xl border bg-card text-card-foreground shadow">
              <div className="p-6">
                <h3 className="text-lg font-semibold">Payroll Management</h3>
                <p className="text-muted-foreground mt-2">
                  Process payroll cycles, generate payslips, and manage compensation.
                </p>
                
                {/* Payroll Cycles */}
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-medium">Current Payroll Cycle</h4>
                    <Button size="sm">Process Payroll</Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm text-blue-600 font-medium">Active Employees</div>
                      <div className="text-2xl font-bold text-blue-900">24</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-sm text-green-600 font-medium">Total Payroll</div>
                      <div className="text-2xl font-bold text-green-900">€45,200</div>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <div className="text-sm text-amber-600 font-medium">Status</div>
                      <div className="text-2xl font-bold text-amber-900">Ready</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}

