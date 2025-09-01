"use client"

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, CheckCircle, XCircle, Clock, Users, Filter } from "lucide-react"

export default function LeaveManagementPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("pending");

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

  // Mock data for leave requests - replace with actual data from API
  const leaveRequests = [
    {
      id: 1,
      employee: "John Smith",
      type: "Vacation",
      startDate: "2024-12-15",
      endDate: "2024-12-20",
      days: 5,
      status: "pending",
      reason: "Family vacation",
      submittedAt: "2024-12-10T10:30:00Z"
    },
    {
      id: 2,
      employee: "Sarah Johnson",
      type: "Sick Leave",
      startDate: "2024-12-18",
      endDate: "2024-12-18",
      days: 1,
      status: "pending",
      reason: "Medical appointment",
      submittedAt: "2024-12-17T14:20:00Z"
    },
    {
      id: 3,
      employee: "Mike Davis",
      type: "Personal",
      startDate: "2024-12-22",
      endDate: "2024-12-23",
      days: 2,
      status: "approved",
      reason: "Personal matters",
      submittedAt: "2024-12-15T09:15:00Z"
    },
    {
      id: 4,
      employee: "Lisa Wang",
      type: "Vacation",
      startDate: "2024-12-25",
      endDate: "2024-12-27",
      days: 3,
      status: "rejected",
      reason: "Holiday travel",
      submittedAt: "2024-12-12T16:45:00Z"
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Vacation":
        return "bg-blue-500";
      case "Sick Leave":
        return "bg-red-500";
      case "Personal":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const pendingRequests = leaveRequests.filter(req => req.status === "pending");
  const approvedRequests = leaveRequests.filter(req => req.status === "approved");
  const rejectedRequests = leaveRequests.filter(req => req.status === "rejected");

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Leave & Absence Management</h2>
            <p className="text-muted-foreground">
              Review and approve leave requests from your team members
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Team Calendar
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingRequests.length}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting your approval
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved This Month</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedRequests.length}</div>
              <p className="text-xs text-muted-foreground">
                Leave requests approved
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
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.3h</div>
              <p className="text-xs text-muted-foreground">
                Time to approve requests
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Leave Requests Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Pending ({pendingRequests.length})</span>
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Approved ({approvedRequests.length})</span>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center space-x-2">
              <XCircle className="h-4 w-4" />
              <span>Rejected ({rejectedRequests.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Leave Requests</CardTitle>
                <CardDescription>
                  Review and approve leave requests from your team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${getTypeColor(request.type)}`} />
                        <div>
                          <p className="font-medium">{request.employee}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.type} • {request.days} day{request.days > 1 ? 's' : ''} • {request.startDate} to {request.endDate}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Reason: {request.reason}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(request.status)}
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
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Approved Leave Requests</CardTitle>
                <CardDescription>
                  Recently approved leave requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {approvedRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${getTypeColor(request.type)}`} />
                        <div>
                          <p className="font-medium">{request.employee}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.type} • {request.days} day{request.days > 1 ? 's' : ''} • {request.startDate} to {request.endDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(request.status)}
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
                <CardTitle>Rejected Leave Requests</CardTitle>
                <CardDescription>
                  Leave requests that were not approved
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rejectedRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${getTypeColor(request.type)}`} />
                        <div>
                          <p className="font-medium">{request.employee}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.type} • {request.days} day{request.days > 1 ? 's' : ''} • {request.startDate} to {request.endDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(request.status)}
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
