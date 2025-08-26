"use client"

import ProtectedRoute from "@/components/auth/protected-route"
import MainLayout from "@/components/layout/main-layout"

export default function DocumentsPage() {

  return (
    <ProtectedRoute requireEmployee>
      <MainLayout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Documents</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-4">
            <div className="rounded-xl border bg-card text-card-foreground shadow">
              <div className="p-6">
                <h3 className="text-lg font-semibold">Document Management</h3>
                <p className="text-muted-foreground">Contract templates and document management coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </MainLayout>
    </ProtectedRoute>
  )
}
