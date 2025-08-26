"use client"

import ProtectedRoute from "@/components/auth/protected-route"
import MainLayout from "@/components/layout/main-layout"
import TimesheetGrid from "@/components/timesheets/timesheet-grid"

export default function TimesheetsPage() {
  return (
    <ProtectedRoute requireEmployee>
      <MainLayout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Timesheets</h2>
        </div>
        <TimesheetGrid />
      </div>
      </MainLayout>
    </ProtectedRoute>
  )
}
