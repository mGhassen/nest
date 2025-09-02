"use client"

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import AdminLayout from "@/components/layout/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Plus, Users, UserPlus } from "lucide-react"
import { LoadingPage } from "@/components/ui/loading-spinner"

export default function TeamsPage() {
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

  // Mock data for teams - replace with actual data from API
  const teams = [
    {
      id: 1,
      name: "Engineering",
      description: "Software development and technical operations",
      members: 12,
      manager: "John Smith",
      color: "bg-blue-500"
    },
    {
      id: 2,
      name: "Marketing",
      description: "Brand management and customer acquisition",
      members: 8,
      manager: "Sarah Johnson",
      color: "bg-green-500"
    },
    {
      id: 3,
      name: "Sales",
      description: "Customer relations and revenue generation",
      members: 15,
      manager: "Mike Davis",
      color: "bg-purple-500"
    },
    {
      id: 4,
      name: "HR",
      description: "Human resources and employee relations",
      members: 5,
      manager: "Lisa Wilson",
      color: "bg-orange-500"
    }
  ];

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Teams</h2>
            <p className="text-muted-foreground">
              Organize employees into teams and manage team structure
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Team
          </Button>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Card key={team.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${team.color}`} />
                    <CardTitle className="text-lg">{team.name}</CardTitle>
                  </div>
                  <Badge variant="secondary">{team.members} members</Badge>
                </div>
                <CardDescription>{team.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Building2 className="mr-2 h-4 w-4" />
                    Manager: {team.manager}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Users className="mr-2 h-4 w-4" />
                      View Members
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Member
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Team Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teams.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teams.reduce((sum, team) => sum + team.members, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Team Size</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(teams.reduce((sum, team) => sum + team.members, 0) / teams.length)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Largest Team</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.max(...teams.map(team => team.members))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
