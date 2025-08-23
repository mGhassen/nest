import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { hasPermission } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "wouter";
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isWeekend } from "date-fns";

export default function LeaveCalendar() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [selectedPolicy, setSelectedPolicy] = useState("all");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Get the first company membership
  const membership = user.memberships?.[0];
  const companyId = membership?.companyId;

  if (!companyId) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Company Access</h2>
          <p className="text-gray-600">You don't have access to any company. Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  // Check permissions
  const canViewLeave = hasPermission(membership, "leave:read");

  if (!canViewLeave) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view the leave calendar.</p>
        </div>
      </div>
    );
  }

  const { data: leaveRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ['/api/companies', companyId, 'leave-requests', { 
      startDate: startOfMonth(currentMonth),
      endDate: endOfMonth(currentMonth)
    }],
    enabled: !!companyId,
  });

  const { data: leavePolicies } = useQuery({
    queryKey: ['/api/companies', companyId, 'leave-policies'],
    enabled: !!companyId,
  });

  // Generate calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Group leave requests by date
  const leaveByDate = new Map();
  if (leaveRequests) {
    leaveRequests.forEach((request: any) => {
      if (request.status === 'APPROVED') {
        const startDate = new Date(request.startDate);
        const endDate = new Date(request.endDate);
        
        // Add each day of the leave period
        const leaveDays = eachDayOfInterval({ start: startDate, end: endDate });
        leaveDays.forEach(day => {
          const dateKey = format(day, 'yyyy-MM-dd');
          if (!leaveByDate.has(dateKey)) {
            leaveByDate.set(dateKey, []);
          }
          leaveByDate.get(dateKey).push(request);
        });
      }
    });
  }

  const getLeaveForDate = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return leaveByDate.get(dateKey) || [];
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentMonth(subMonths(currentMonth, 1));
    } else {
      setCurrentMonth(addMonths(currentMonth, 1));
    }
  };

  return (
    <div className="p-6" data-testid="leave-calendar">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/leave">
              <Button variant="outline" size="sm" data-testid="button-back-to-leave">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Leave Management
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Team Leave Calendar</h1>
              <p className="text-gray-600">View approved leave requests across your team</p>
            </div>
            
            {/* Filters */}
            <div className="flex items-center space-x-3">
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="w-40" data-testid="select-team-filter">
                  <SelectValue placeholder="All Teams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedPolicy} onValueChange={setSelectedPolicy}>
                <SelectTrigger className="w-40" data-testid="select-policy-filter">
                  <SelectValue placeholder="All Leave Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Leave Types</SelectItem>
                  {leavePolicies?.map((policy: any) => (
                    <SelectItem key={policy.id} value={policy.id}>
                      {policy.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{format(currentMonth, 'MMMM yyyy')}</CardTitle>
                <CardDescription>Team leave schedule for the month</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                  data-testid="button-previous-month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date())}
                  data-testid="button-current-month"
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                  data-testid="button-next-month"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {requestsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Calendar Header */}
                <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div key={day} className="bg-gray-50 p-3 text-center">
                      <span className="text-sm font-medium text-gray-900">{day}</span>
                    </div>
                  ))}
                </div>

                {/* Calendar Body */}
                <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden min-h-[600px]">
                  {/* Add padding days for the start of the month */}
                  {Array.from({ length: (monthStart.getDay() + 6) % 7 }, (_, i) => (
                    <div key={`padding-${i}`} className="bg-gray-50 p-2"></div>
                  ))}
                  
                  {/* Calendar days */}
                  {calendarDays.map((day) => {
                    const dayLeave = getLeaveForDate(day);
                    const isToday = isSameDay(day, new Date());
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isWeekendDay = isWeekend(day);

                    return (
                      <div
                        key={format(day, 'yyyy-MM-dd')}
                        className={`bg-white p-2 min-h-[100px] border-r border-b border-gray-100 ${
                          !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                        } ${isWeekendDay ? 'bg-gray-50' : ''}`}
                        data-testid={`calendar-day-${format(day, 'yyyy-MM-dd')}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span 
                            className={`text-sm font-medium ${
                              isToday 
                                ? 'bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center' 
                                : ''
                            }`}
                          >
                            {format(day, 'd')}
                          </span>
                        </div>
                        
                        {/* Leave requests for this day */}
                        <div className="space-y-1">
                          {dayLeave.slice(0, 3).map((leave: any, index: number) => (
                            <div
                              key={`${leave.id}-${index}`}
                              className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate"
                              title={`Employee #${leave.employeeId} - ${leave.quantity} ${leave.unit.toLowerCase()}`}
                            >
                              Employee #{leave.employeeId.slice(-4)}
                            </div>
                          ))}
                          {dayLeave.length > 3 && (
                            <div className="text-xs text-gray-500">
                              +{dayLeave.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
                <span className="text-sm text-gray-700">Approved Leave</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded"></div>
                <span className="text-sm text-gray-700">Weekend</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-primary rounded-full"></div>
                <span className="text-sm text-gray-700">Today</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
