"use client"

import { useState } from "react"
import AuthGuard from "@/components/auth/auth-guard"
import AdminLayout from "@/components/layout/admin-layout"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState("Nest HR Solutions")
  const [industry, setIndustry] = useState("Technology")

  return (
    <AuthGuard requireAdmin={true}>
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
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Enter company name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Industry
                      </label>
                      <input
                        type="text"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Enter industry"
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
    </AuthGuard>
  )
}

