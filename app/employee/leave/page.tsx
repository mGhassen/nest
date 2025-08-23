"use client"

import MainLayout from "@/components/layout/main-layout"
import LeaveRequests from "@/components/leave/leave-requests"

export default function LeavePage() {
  return (
    <MainLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Leave Management</h2>
        </div>
        <LeaveRequests />
      </div>
    </MainLayout>
  )
}
