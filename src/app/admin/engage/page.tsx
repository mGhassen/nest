"use client"

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import AdminLayout from "@/components/layout/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Users, Calendar, Star, TrendingUp, Clock } from "lucide-react"
import Link from "next/link"
import { LoadingPage } from "@/components/ui/loading-spinner"

export default function EngagePage() {
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
    return <LoadingPage />;
  }

  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Employee Engagement</h2>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/admin/engage/meetings">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Meetings</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Meeting Management</div>
                <p className="text-xs text-muted-foreground">
                  Schedule and manage team meetings
                </p>
                <div className="mt-4 flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-3 w-3 text-blue-500" />
                    <span>3 This Week</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-1 h-3 w-3 text-green-500" />
                    <span>24 Participants</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/engage/reviews">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Review Cycle</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Performance Reviews</div>
                <p className="text-xs text-muted-foreground">
                  Manage performance review cycles
                </p>
                <div className="mt-4 flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <Clock className="mr-1 h-3 w-3 text-orange-500" />
                    <span>5 Pending</span>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                    <span>12 Completed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Engagement Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Meetings</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                Scheduled this week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">
                Awaiting completion
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Participation</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85%</div>
              <p className="text-xs text-muted-foreground">
                Meeting attendance rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.2</div>
              <p className="text-xs text-muted-foreground">
                Performance score
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Meetings</CardTitle>
              <CardDescription>
                Your scheduled meetings for the next few days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Team Standup</p>
                      <p className="text-xs text-muted-foreground">Today, 9:00 AM</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">Join</Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Performance Review</p>
                      <p className="text-xs text-muted-foreground">Tomorrow, 2:00 PM</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">Prepare</Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium">All Hands Meeting</p>
                      <p className="text-xs text-muted-foreground">Friday, 10:00 AM</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">View</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Review Progress</CardTitle>
              <CardDescription>
                Current performance review cycle status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Q4 2024 Reviews</span>
                  <span className="text-sm text-muted-foreground">12/17 completed</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '70%' }}></div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">John Smith</span>
                    <Button size="sm" variant="outline">Review</Button>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Sarah Johnson</span>
                    <Button size="sm" variant="outline">Review</Button>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Mike Davis</span>
                    <Button size="sm" variant="outline">Review</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
