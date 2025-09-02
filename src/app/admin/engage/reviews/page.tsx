"use client"

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, Users, Clock, CheckCircle, TrendingUp, Calendar, Plus, FileText } from "lucide-react"
import { LoadingPage } from "@/components/ui/loading-spinner"

export default function ReviewCyclePage() {
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
    return <LoadingPage />;
  }

  if (!user || !user.isAdmin) {
    return null;
  }

  // Mock data for performance reviews - replace with actual data from API
  const reviews = [
    {
      id: 1,
      employee: "John Smith",
      position: "Senior Developer",
      department: "Engineering",
      cycle: "Q4 2024",
      status: "pending",
      dueDate: "2024-12-20",
      lastReview: "Q3 2024",
      currentRating: 4.2,
      goals: [
        { title: "Complete project Alpha", status: "completed", progress: 100 },
        { title: "Improve code quality", status: "in-progress", progress: 75 },
        { title: "Mentor junior developers", status: "in-progress", progress: 60 }
      ],
      submittedAt: null
    },
    {
      id: 2,
      employee: "Sarah Johnson",
      position: "Marketing Manager",
      department: "Marketing",
      cycle: "Q4 2024",
      status: "pending",
      dueDate: "2024-12-22",
      lastReview: "Q3 2024",
      currentRating: 4.5,
      goals: [
        { title: "Launch Q4 campaign", status: "completed", progress: 100 },
        { title: "Increase brand awareness", status: "in-progress", progress: 80 },
        { title: "Team development", status: "in-progress", progress: 70 }
      ],
      submittedAt: null
    },
    {
      id: 3,
      employee: "Mike Davis",
      position: "Sales Representative",
      department: "Sales",
      cycle: "Q4 2024",
      status: "completed",
      dueDate: "2024-12-15",
      lastReview: "Q3 2024",
      currentRating: 4.0,
      goals: [
        { title: "Meet sales targets", status: "completed", progress: 100 },
        { title: "Client relationship building", status: "completed", progress: 100 },
        { title: "Product knowledge", status: "completed", progress: 100 }
      ],
      submittedAt: "2024-12-14T16:30:00Z"
    },
    {
      id: 4,
      employee: "Lisa Wang",
      position: "HR Specialist",
      department: "Human Resources",
      cycle: "Q4 2024",
      status: "overdue",
      dueDate: "2024-12-10",
      lastReview: "Q3 2024",
      currentRating: 3.8,
      goals: [
        { title: "Recruitment efficiency", status: "in-progress", progress: 65 },
        { title: "Employee satisfaction", status: "in-progress", progress: 55 },
        { title: "Policy updates", status: "pending", progress: 30 }
      ],
      submittedAt: null
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
      case "completed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" />Completed</Badge>;
      case "overdue":
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><Clock className="mr-1 h-3 w-3" />Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getGoalStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "in-progress":
        return "bg-blue-500";
      case "pending":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const pendingReviews = reviews.filter(review => review.status === "pending");
  const completedReviews = reviews.filter(review => review.status === "completed");
  const overdueReviews = reviews.filter(review => review.status === "overdue");

  const overallProgress = Math.round((completedReviews.length / reviews.length) * 100);
  const averageRating = reviews.reduce((sum, review) => sum + review.currentRating, 0) / reviews.length;

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Performance Review Cycle</h2>
            <p className="text-muted-foreground">
              Manage and conduct performance reviews for your team
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Review
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Start New Cycle
            </Button>
          </div>
        </div>

        {/* Cycle Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="mr-2 h-5 w-5" />
              Q4 2024 Review Cycle
            </CardTitle>
            <CardDescription>
              Current performance review cycle progress and statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-muted-foreground">{overallProgress}%</span>
                </div>
                <Progress value={overallProgress} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Average Rating</span>
                  <span className="text-sm text-muted-foreground">{averageRating.toFixed(1)}/5</span>
                </div>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(averageRating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Completed</span>
                  <span className="text-sm text-muted-foreground">{completedReviews.length}/{reviews.length}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {completedReviews.length} of {reviews.length} reviews done
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overdue</span>
                  <span className="text-sm text-muted-foreground">{overdueReviews.length}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {overdueReviews.length > 0 ? "Requires attention" : "All on track"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingReviews.length}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting completion
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedReviews.length}</div>
              <p className="text-xs text-muted-foreground">
                Reviews finished
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reviews.length}</div>
              <p className="text-xs text-muted-foreground">
                Under review
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                Out of 5.0
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Reviews Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Pending ({pendingReviews.length})</span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Completed ({completedReviews.length})</span>
            </TabsTrigger>
            <TabsTrigger value="overdue" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Overdue ({overdueReviews.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Performance Reviews</CardTitle>
                <CardDescription>
                  Reviews that need to be completed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingReviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">{review.employee}</h3>
                            <Badge variant="outline">{review.position}</Badge>
                            {getStatusBadge(review.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {review.department} • Due: {review.dueDate}
                          </p>
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center">
                              <Star className="mr-1 h-3 w-3 text-yellow-400" />
                              Current: {review.currentRating}/5
                            </div>
                            <div className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              Last: {review.lastReview}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <FileText className="mr-2 h-4 w-4" />
                            Start Review
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Goals Progress:</h4>
                        {review.goals.map((goal, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${getGoalStatusColor(goal.status)}`} />
                              <span className="text-sm">{goal.title}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Progress value={goal.progress} className="w-20 h-1" />
                              <span className="text-xs text-muted-foreground">{goal.progress}%</span>
                            </div>
                          </div>
                        ))}
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
                <CardTitle>Completed Performance Reviews</CardTitle>
                <CardDescription>
                  Recently completed performance reviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {completedReviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">{review.employee}</h3>
                            <Badge variant="outline">{review.position}</Badge>
                            {getStatusBadge(review.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {review.department} • Completed: {review.submittedAt ? new Date(review.submittedAt).toLocaleDateString() : 'N/A'}
                          </p>
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center">
                              <Star className="mr-1 h-3 w-3 text-yellow-400" />
                              Rating: {review.currentRating}/5
                            </div>
                            <div className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              Last: {review.lastReview}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <FileText className="mr-2 h-4 w-4" />
                            View Review
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overdue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Overdue Performance Reviews</CardTitle>
                <CardDescription>
                  Reviews that are past their due date
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {overdueReviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-4 border-red-200 bg-red-50">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">{review.employee}</h3>
                            <Badge variant="outline">{review.position}</Badge>
                            {getStatusBadge(review.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {review.department} • Overdue since: {review.dueDate}
                          </p>
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center">
                              <Star className="mr-1 h-3 w-3 text-yellow-400" />
                              Current: {review.currentRating}/5
                            </div>
                            <div className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              Last: {review.lastReview}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="text-red-600 border-red-300">
                            <FileText className="mr-2 h-4 w-4" />
                            Complete Now
                          </Button>
                        </div>
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
