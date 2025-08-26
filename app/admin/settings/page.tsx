"use client"

import { useAuth } from "@/lib/auth/auth-context"
import { useEffect } from "react"
import { redirect } from "next/navigation"
import AdminLayout from "@/components/layout/admin-layout"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
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
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-4">
            <div className="rounded-xl border bg-card text-card-foreground shadow">
              <div className="p-6">
                <h3 className="text-lg font-semibold">Company Settings</h3>
                <p className="text-muted-foreground mt-2">
                  Configure company profile, pay calendars, and system settings.
                </p>
                
                {/* Company Information */}
                <div className="mt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        defaultValue="Nest HR Solutions"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Industry
                      </label>
                      <input
                        type="text"
                        defaultValue="Technology"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button variant="outline">Cancel</Button>
                    <Button>Save Changes</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

