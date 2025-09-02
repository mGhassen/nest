"use client"

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, CheckCircle, XCircle, Users, Filter, Calendar, FileText } from "lucide-react"
import { LoadingPage } from "@/components/ui/loading-spinner"

export default function TimesheetManagementPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedWeek, setSelectedWeek] = useState("2024-12-09");

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/auth/login");
    } else if (!user.isAdmin) {
      router.replace("/unauthorized");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!user || !user.isAdmin) {
    return null;
  }

  // Mock data for timesheets - replace with actual data from API
  const timesheets = [
    {
      id: 1,
      employee: "John Smith",
      week: "2024-12-09",
      totalHours: 40,
      status: "pending",
      submittedAt: "2024-12-15T17:30:00Z",
      details: [
        { day: "Mon", date: "2024-12-09", hours: 8, project: "Project Alpha" },
        { day: "Tue", date: "2024-12-10", hours: 8, project: "Project Alpha" },
        { day: "Wed", date: "2024-12-11", hours: 8, project: "Project Beta" },
        { day: "Thu", date: "2024-12-12", hours: 8, project: "Project Beta" },
        { day: "Fri", date: "2024-12-13", hours: 8, project: "Project Alpha" }
      ]
    },
    {
      id: 2,
      employee: "Sarah Johnson",
      week: "2024-12-09",
      totalHours: 40,
      status: "pending",
      submittedAt: "2024-12-15T18:15:00Z",
      details: [
        { day: "Mon", date: "2024-12-09", hours: 8, project: "Project Gamma" },
        { day: "Tue", date: "2024-12-10", hours: 8, project: "Project Gamma" },
        { day: "Wed", date: "2024-12-11", hours: 8, project: "Project Delta" },
        { day: "Thu", date: "2024-12-12", hours: 8, project: "Project Delta" },
        { day: "Fri", date: "2024-12-13", hours: 8, project: "Project Gamma" }
      ]
    },
    {
      id: 3,
      employee: "Mike Davis",
      week: "2024-12-02",
      totalHours: 40,
      status: "approved",
      submittedAt: "2024-12-08T16:45:00Z",
      details: [
        { day: "Mon", date: "2024-12-02", hours: 8, project: "Project Alpha" },
        { day: "Tue", date: "2024-12-03", hours: 8, project: "Project Alpha" },
        { day: "Wed", date: "2024-12-04", hours: 8, project: "Project Beta" },
        { day: "Thu", date: "2024-12-05", hours: 8, project: "Project Beta" },
        { day: "Fri", date: "2024-12-06", hours: 8, project: "Project Alpha" }
      ]
    },
    {
      id: 4,
      employee: "Lisa Wang",
      week: "2024-12-02",
      totalHours: 35,
      status: "rejected",
      submittedAt: "2024-12-08T17:20:00Z",
      details: [
        { day: "Mon", date: "2024-12-02", hours: 7, project: "Project Gamma" },
        { day: "Tue", date: "2024-12-03", hours: 7, project: "Project Gamma" },
        { day: "Wed", date: "2024-12-04", hours: 7, project: "Project Delta" },
        { day: "Thu", date: "2024-12-05", hours: 7, project: "Project Delta" },
        { day: "Fri", date: "2024-12-06", hours: 7, project: "Project Gamma" }
      ]
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
      case "approved":
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" />Approved</Badge>;
      case "rejected":
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const pendingTimesheets = timesheets.filter(ts => ts.status === "pending");
  const approvedTimesheets = timesheets.filter(ts => ts.status === "approved");
  const rejectedTimesheets = timesheets.filter(ts => ts.status === "rejected");

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Timesheet Management</h2>
            <p className="text-muted-foreground">
              Review and validate timesheet submissions from your team
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Week View
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Timesheets</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingTimesheets.length}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting validation
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved This Week</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedTimesheets.length}</div>
              <p className="text-xs text-muted-foreground">
                Timesheets validated
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hours This Week</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {timesheets.reduce((sum, ts) => sum + ts.totalHours, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Hours logged by team
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
        </div>

        {/* Timesheet Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Pending ({pendingTimesheets.length})</span>
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Approved ({approvedTimesheets.length})</span>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center space-x-2">
              <XCircle className="h-4 w-4" />
              <span>Rejected ({rejectedTimesheets.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Timesheet Submissions</CardTitle>
                <CardDescription>
                  Review and validate timesheet submissions from your team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingTimesheets.map((timesheet) => (
                    <div key={timesheet.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="font-medium">{timesheet.employee}</p>
                          <p className="text-sm text-muted-foreground">
                            Week of {timesheet.week} • {timesheet.totalHours} hours
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(timesheet.status)}
                          <div className="flex space-x-1">
                            <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-5 gap-2 text-sm">
                        {timesheet.details.map((detail, index) => (
                          <div key={index} className="text-center p-2 bg-muted rounded">
                            <div className="font-medium">{detail.day}</div>
                            <div className="text-muted-foreground">{detail.hours}h</div>
                            <div className="text-xs text-muted-foreground">{detail.project}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Approved Timesheets</CardTitle>
                <CardDescription>
                  Recently approved timesheet submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {approvedTimesheets.map((timesheet) => (
                    <div key={timesheet.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="font-medium">{timesheet.employee}</p>
                          <p className="text-sm text-muted-foreground">
                            Week of {timesheet.week} • {timesheet.totalHours} hours
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(timesheet.status)}
                        </div>
                      </div>
                      <div className="grid grid-cols-5 gap-2 text-sm">
                        {timesheet.details.map((detail, index) => (
                          <div key={index} className="text-center p-2 bg-muted rounded">
                            <div className="font-medium">{detail.day}</div>
                            <div className="text-muted-foreground">{detail.hours}h</div>
                            <div className="text-xs text-muted-foreground">{detail.project}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Rejected Timesheets</CardTitle>
                <CardDescription>
                  Timesheet submissions that were not approved
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rejectedTimesheets.map((timesheet) => (
                    <div key={timesheet.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="font-medium">{timesheet.employee}</p>
                          <p className="text-sm text-muted-foreground">
                            Week of {timesheet.week} • {timesheet.totalHours} hours
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(timesheet.status)}
                        </div>
                      </div>
                      <div className="grid grid-cols-5 gap-2 text-sm">
                        {timesheet.details.map((detail, index) => (
                          <div key={index} className="text-center p-2 bg-muted rounded">
                            <div className="font-medium">{detail.day}</div>
                            <div className="text-muted-foreground">{detail.hours}h</div>
                            <div className="text-xs text-muted-foreground">{detail.project}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
