"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import EmployeeLayout from "@/components/layout/employee-layout"
import { LoadingPage } from "@/components/ui/loading-spinner"

export default function EmployeeDashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/auth/login");
    } else if (user.isAdmin) {
      router.replace("/admin/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!user || user.isAdmin) return null;

  return (
    <EmployeeLayout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">
              Welcome back, Employee!
            </h2>
          </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-4">
            <div className="rounded-xl border bg-card text-card-foreground shadow">
              <div className="p-6">
                <h3 className="text-lg font-semibold">
                  Welcome to Your Employee Portal
                </h3>
                <p className="text-muted-foreground mt-2">
                  Access your timesheets, leave requests, and personal information.
                </p>
              </div>
            </div>
          </div>
          
          <div className="col-span-2">
            <div className="rounded-xl border bg-card text-card-foreground shadow">
              <div className="p-6">
                <h3 className="text-lg font-semibold">My Timesheets</h3>
                <p className="text-muted-foreground mt-2">
                  View and submit your weekly timesheets.
                </p>
                <div className="mt-4">
                  <a 
                    href="/employee/timesheets" 
                    className="text-primary hover:underline"
                  >
                    Go to Timesheets →
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-span-2">
            <div className="rounded-xl border bg-card text-card-foreground shadow">
              <div className="p-6">
                <h3 className="text-lg font-semibold">Leave Requests</h3>
                <p className="text-muted-foreground mt-2">
                  Request time off and view your leave balance.
                </p>
                <div className="mt-4">
                  <a 
                    href="/employee/leave" 
                    className="text-primary hover:underline"
                  >
                    Request Leave →
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-span-4">
            <div className="rounded-xl border bg-card text-card-foreground shadow">
              <div className="p-6">
                <h3 className="text-lg font-semibold">My Profile</h3>
                <p className="text-muted-foreground mt-2">
                  View and update your personal information and documents.
                </p>
                <div className="mt-4">
                  <a 
                    href="/employee/documents" 
                    className="text-primary hover:underline"
                  >
                    View Documents →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
              </div>
    </EmployeeLayout>
  );
}
