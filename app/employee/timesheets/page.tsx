"use client"

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import TimesheetGrid from "@/components/timesheets/timesheet-grid";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfWeek, addWeeks, subWeeks } from "date-fns";
import ProtectedRoute from "@/components/auth/protected-route";
import MainLayout from "@/components/layout/main-layout";

export default function TimesheetsPage() {
  const [selectedWeek, setSelectedWeek] = useState(startOfWeek(new Date()));
  const [timeframe, setTimeframe] = useState("current");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: timesheets = [], isLoading } = useQuery({
    queryKey: ['/api/timesheets'],
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to load timesheets",
        variant: "destructive",
      });
    },
  });

  const updateTimesheetMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/timesheets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/timesheets'] });
      toast({
        title: "Success",
        description: "Timesheet updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update timesheet",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (id: string) => {
    updateTimesheetMutation.mutate({ id, status: 'APPROVED' });
  };

  const handleReject = (id: string) => {
    updateTimesheetMutation.mutate({ id, status: 'REJECTED' });
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your timesheet export is being generated",
    });
    // TODO: Implement CSV export
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setSelectedWeek(current => 
      direction === 'prev' ? subWeeks(current, 1) : addWeeks(current, 1)
    );
  };

  // Calculate statistics
  const stats = {
    submitted: timesheets.filter((t: any) => t.status === 'SUBMITTED').length,
    pending: timesheets.filter((t: any) => t.status === 'SUBMITTED').length,
    approved: timesheets.filter((t: any) => t.status === 'APPROVED').length,
  };

  if (isLoading) {
    return (
      <ProtectedRoute requireEmployee>
        <MainLayout>
          <div className="flex items-center justify-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireEmployee>
      <MainLayout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-foreground" data-testid="text-timesheets-title">
                Timesheet Management
              </h1>
              <div className="flex items-center space-x-3">
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger className="w-48" data-testid="select-timeframe">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Current Week</SelectItem>
                    <SelectItem value="last">Last Week</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={handleExport} data-testid="button-export-csv">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-foreground" data-testid="text-submitted-count">
                    {stats.submitted}
                  </div>
                  <div className="text-sm text-muted-foreground">Submitted</div>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-amber-600" data-testid="text-pending-count">
                    {stats.pending}
                  </div>
                  <div className="text-sm text-muted-foreground">Pending Approval</div>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-green-600" data-testid="text-approved-count">
                    {stats.approved}
                  </div>
                  <div className="text-sm text-muted-foreground">Approved</div>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Week Navigation */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle data-testid="text-week-title">
                  Week of {format(selectedWeek, 'MMMM dd, yyyy')}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateWeek('prev')}
                    data-testid="button-previous-week"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground" data-testid="text-week-info">
                    Week {format(selectedWeek, 'w, yyyy')}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateWeek('next')}
                    data-testid="button-next-week"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <TimesheetGrid
                timesheets={timesheets}
                selectedWeek={selectedWeek}
                onApprove={handleApprove}
                onReject={handleReject}
                isLoading={updateTimesheetMutation.isPending}
              />
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
