"use client"

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import AdminLayout from "@/components/layout/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Network, Users, Building2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import { LoadingPage } from "@/components/ui/loading-spinner"

export default function OrgChartPage() {
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

  // Mock organizational data - replace with actual data from API
  const orgData = {
    ceo: {
      name: "Alex Thompson",
      title: "CEO",
      department: "Executive",
      avatar: "AT",
      reports: ["cto", "cfo", "cmo", "chro"]
    },
    cto: {
      name: "Sarah Chen",
      title: "CTO",
      department: "Engineering",
      avatar: "SC",
      reports: ["eng-manager-1", "eng-manager-2"]
    },
    cfo: {
      name: "Michael Rodriguez",
      title: "CFO",
      department: "Finance",
      avatar: "MR",
      reports: ["finance-manager"]
    },
    cmo: {
      name: "Emily Davis",
      title: "CMO",
      department: "Marketing",
      avatar: "ED",
      reports: ["marketing-manager"]
    },
    chro: {
      name: "David Kim",
      title: "CHRO",
      department: "Human Resources",
      avatar: "DK",
      reports: ["hr-manager"]
    },
    "eng-manager-1": {
      name: "John Smith",
      title: "Engineering Manager",
      department: "Engineering",
      avatar: "JS",
      reports: ["dev-1", "dev-2", "dev-3"]
    },
    "eng-manager-2": {
      name: "Lisa Wang",
      title: "Engineering Manager",
      department: "Engineering",
      avatar: "LW",
      reports: ["dev-4", "dev-5"]
    },
    "finance-manager": {
      name: "Robert Johnson",
      title: "Finance Manager",
      department: "Finance",
      avatar: "RJ",
      reports: ["accountant-1", "accountant-2"]
    },
    "marketing-manager": {
      name: "Jennifer Brown",
      title: "Marketing Manager",
      department: "Marketing",
      avatar: "JB",
      reports: ["marketer-1", "marketer-2"]
    },
    "hr-manager": {
      name: "Amanda Wilson",
      title: "HR Manager",
      department: "Human Resources",
      avatar: "AW",
      reports: ["hr-specialist-1"]
    }
  };

  const getDepartmentColor = (department: string) => {
    const colors = {
      "Executive": "bg-purple-500",
      "Engineering": "bg-blue-500",
      "Finance": "bg-green-500",
      "Marketing": "bg-orange-500",
      "Human Resources": "bg-pink-500"
    };
    return colors[department as keyof typeof colors] || "bg-gray-500";
  };

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Organization Chart</h2>
            <p className="text-muted-foreground">
              Visualize your company's organizational structure and hierarchy
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <ZoomOut className="mr-2 h-4 w-4" />
              Zoom Out
            </Button>
            <Button variant="outline" size="sm">
              <ZoomIn className="mr-2 h-4 w-4" />
              Zoom In
            </Button>
            <Button variant="outline" size="sm">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset View
            </Button>
          </div>
        </div>

        {/* Department Legend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {["Executive", "Engineering", "Finance", "Marketing", "Human Resources"].map((dept) => (
                <div key={dept} className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getDepartmentColor(dept)}`} />
                  <span className="text-sm">{dept}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Organization Chart Visualization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Network className="mr-2 h-5 w-5" />
              Organizational Structure
            </CardTitle>
            <CardDescription>
              Click on any employee to view their details and direct reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="min-h-[600px] bg-gradient-to-br from-muted/20 to-background rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
              <div className="text-center space-y-4">
                <Network className="h-16 w-16 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold text-muted-foreground">Interactive Org Chart</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    This will display an interactive organizational chart showing the company hierarchy, 
                    reporting relationships, and department structure.
                  </p>
                </div>
                <Button variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Load Organization Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">40</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Management Levels</CardTitle>
              <Network className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Team Size</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
