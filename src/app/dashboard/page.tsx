"use client"

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import StatsCards from "@/components/dashboard/stats-cards";
import RecentActivity from "@/components/dashboard/recent-activity";
import TeamOverview from "@/components/dashboard/team-overview";
import AdvancedAnalytics from "@/components/admin/advanced-analytics";
import PendingActions from "@/components/dashboard/pending-actions";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function DashboardPage() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: stats, isLoading: statsLoading, refetch } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    retry: false,
  });

  if (isLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-96 bg-background">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Dashboard Refreshed",
      description: "All data has been updated",
    });
  };

  return (
    <div className="p-6" data-testid="dashboard-page">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground" data-testid="text-dashboard-title">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1" data-testid="text-dashboard-subtitle">
              Get insights into your workforce
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select 
              className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              defaultValue="30d"
              data-testid="select-timeframe"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="12m">Last 12 months</option>
            </select>
            <Button 
              onClick={handleRefresh}
              className="px-4 py-2 text-sm font-medium rounded-md"
              data-testid="button-refresh"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={stats as any} />
      </div>

      {/* Pending Actions Section */}
      <div className="mb-8">
        <PendingActions />
      </div>

      {/* Advanced Analytics Section */}
      <div className="mb-8">
        <AdvancedAnalytics />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <RecentActivity />
        <TeamOverview />
      </div>
    </div>
  );
}
