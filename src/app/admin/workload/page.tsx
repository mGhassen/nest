"use client"

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import AdminLayout from "@/components/layout/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Calendar, CheckCircle, AlertCircle, Users, FileText } from "lucide-react"
import Link from "next/link"

export default function WorkloadPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/auth/login");
    } else if (!user.isAdmin) {
      router.replace("/unauthorized");
    }
  }, [user, isLoading, router]);

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
          <h2 className="text-3xl font-bold tracking-tight">Workload Management</h2>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/admin/workload/leave">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Leave & Absence</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Manage Leave</div>
                <p className="text-xs text-muted-foreground">
                  Approve leave requests and manage team calendar
                </p>
                <div className="mt-4 flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <AlertCircle className="mr-1 h-3 w-3 text-orange-500" />
                    <span>5 Pending</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
                    <span>12 Approved</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/workload/timesheet">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Timesheet</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Validate Timesheets</div>
                <p className="text-xs text-muted-foreground">
                  Review and approve team timesheets
                </p>
                <div className="mt-4 flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <AlertCircle className="mr-1 h-3 w-3 text-orange-500" />
                    <span>8 Pending</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
                    <span>25 Approved</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Leave Requests</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">
                Require your approval
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Timesheets</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                Awaiting validation
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                Under your management
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week's Hours</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">960</div>
              <p className="text-xs text-muted-foreground">
                Total logged hours
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest leave requests and timesheet submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">John Smith requested vacation leave</p>
                    <p className="text-xs text-muted-foreground">Dec 15-20, 2024</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Review</Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Sarah Johnson submitted timesheet</p>
                    <p className="text-xs text-muted-foreground">Week of Dec 9-15, 2024</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Validate</Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium">Mike Davis requested sick leave</p>
                    <p className="text-xs text-muted-foreground">Dec 18, 2024</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Review</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
