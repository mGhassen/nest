"use client"

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Calendar, Users, Clock, Plus, Video, MapPin, CheckCircle } from "lucide-react"

export default function MeetingsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("upcoming");

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

  // Mock data for meetings - replace with actual data from API
  const meetings = [
    {
      id: 1,
      title: "Team Standup",
      type: "recurring",
      date: "2024-12-16",
      time: "09:00",
      duration: 30,
      location: "Conference Room A",
      attendees: ["John Smith", "Sarah Johnson", "Mike Davis", "Lisa Wang"],
      status: "upcoming",
      description: "Daily team standup meeting to discuss progress and blockers"
    },
    {
      id: 2,
      title: "Performance Review - John Smith",
      type: "one-time",
      date: "2024-12-17",
      time: "14:00",
      duration: 60,
      location: "Virtual",
      attendees: ["John Smith", "Alex Thompson"],
      status: "upcoming",
      description: "Q4 2024 performance review meeting"
    },
    {
      id: 3,
      title: "All Hands Meeting",
      type: "one-time",
      date: "2024-12-20",
      time: "10:00",
      duration: 90,
      location: "Main Conference Room",
      attendees: ["All Employees"],
      status: "upcoming",
      description: "Company-wide meeting to discuss Q4 results and Q1 planning"
    },
    {
      id: 4,
      title: "Project Planning Session",
      type: "one-time",
      date: "2024-12-10",
      time: "15:00",
      duration: 120,
      location: "Conference Room B",
      attendees: ["Engineering Team"],
      status: "completed",
      description: "Planning session for Q1 2025 projects"
    },
    {
      id: 5,
      title: "Weekly Team Sync",
      type: "recurring",
      date: "2024-12-12",
      time: "11:00",
      duration: 45,
      location: "Virtual",
      attendees: ["Marketing Team"],
      status: "completed",
      description: "Weekly marketing team synchronization meeting"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Clock className="mr-1 h-3 w-3" />Upcoming</Badge>;
      case "completed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" />Completed</Badge>;
      case "cancelled":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "recurring":
        return <Badge variant="outline" className="text-blue-600">Recurring</Badge>;
      case "one-time":
        return <Badge variant="outline" className="text-green-600">One-time</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const upcomingMeetings = meetings.filter(meeting => meeting.status === "upcoming");
  const completedMeetings = meetings.filter(meeting => meeting.status === "completed");

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Meeting Management</h2>
            <p className="text-muted-foreground">
              Schedule and manage team meetings and performance reviews
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Schedule Meeting
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Meetings</CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingMeetings.length}</div>
              <p className="text-xs text-muted-foreground">
                Scheduled this week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                Team members involved
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">69m</div>
              <p className="text-xs text-muted-foreground">
                Average meeting length
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">95%</div>
              <p className="text-xs text-muted-foreground">
                Meetings held as scheduled
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Meetings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="upcoming" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Upcoming ({upcomingMeetings.length})</span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Completed ({completedMeetings.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Meetings</CardTitle>
                <CardDescription>
                  Your scheduled meetings for the coming days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingMeetings.map((meeting) => (
                    <div key={meeting.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">{meeting.title}</h3>
                            {getTypeBadge(meeting.type)}
                            {getStatusBadge(meeting.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {meeting.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              {meeting.date} at {meeting.time}
                            </div>
                            <div className="flex items-center">
                              <Clock className="mr-1 h-3 w-3" />
                              {meeting.duration} minutes
                            </div>
                            <div className="flex items-center">
                              {meeting.location === "Virtual" ? (
                                <Video className="mr-1 h-3 w-3" />
                              ) : (
                                <MapPin className="mr-1 h-3 w-3" />
                              )}
                              {meeting.location}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                          <Button size="sm" variant="outline">
                            Cancel
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {meeting.attendees.length} attendee{meeting.attendees.length > 1 ? 's' : ''}
                          </span>
                        </div>
                        <Button size="sm">
                          Join Meeting
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Completed Meetings</CardTitle>
                <CardDescription>
                  Recently completed meetings and their outcomes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {completedMeetings.map((meeting) => (
                    <div key={meeting.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">{meeting.title}</h3>
                            {getTypeBadge(meeting.type)}
                            {getStatusBadge(meeting.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {meeting.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              {meeting.date} at {meeting.time}
                            </div>
                            <div className="flex items-center">
                              <Clock className="mr-1 h-3 w-3" />
                              {meeting.duration} minutes
                            </div>
                            <div className="flex items-center">
                              {meeting.location === "Virtual" ? (
                                <Video className="mr-1 h-3 w-3" />
                              ) : (
                                <MapPin className="mr-1 h-3 w-3" />
                              )}
                              {meeting.location}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            View Notes
                          </Button>
                          <Button size="sm" variant="outline">
                            Reschedule
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {meeting.attendees.length} attendee{meeting.attendees.length > 1 ? 's' : ''}
                          </span>
                        </div>
                        <Button size="sm" variant="outline">
                          View Summary
                        </Button>
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
