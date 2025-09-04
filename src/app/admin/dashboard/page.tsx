"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import AdminLayout from "@/components/layout/admin-layout"
import { Button } from "@/components/ui/button"
import { Calendar, Plus } from "lucide-react"
import StatsCards from "@/components/dashboard/stats-cards"
import TeamOverview from "@/components/dashboard/team-overview"
import RecentActivity from "@/components/dashboard/recent-activity"
import PendingActions from "@/components/dashboard/pending-actions"
import { LoadingPage } from "@/components/ui/loading-spinner"

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/auth/login");
    } else if (user.role !== 'SUPERUSER' && user.role !== 'ADMIN') {
      router.replace("/unauthorized");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!user || (user.role !== 'SUPERUSER' && user.role !== 'ADMIN')) {
    return null;
  }

  return (
    <AdminLayout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">
              Welcome back, Admin!
            </h2>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Calendar className="mr-2 h-4 w-4" />
                View Calendar
              </Button>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
            </div>
          </div>
          
          {/* Stats Overview */}
          <StatsCards />
          
          {/* Main Dashboard Content */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4">
              <TeamOverview />
            </div>
            <div className="col-span-3">
              <RecentActivity />
            </div>
          </div>
          
          {/* Pending Actions */}
          <PendingActions />
        </div>
    </AdminLayout>
  );
}
