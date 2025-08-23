import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Users,
  Clock,
  UserX,
  Filter,
  Download
} from "lucide-react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  getDay,
  startOfWeek,
  endOfWeek,
  isToday,
  isWeekend,
  parseISO
} from "date-fns";
import type { LeaveRequest, Employee } from "@shared/schema";

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  leaveRequests: (LeaveRequest & { employee: Employee })[];
}

export default function TeamCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [statusFilter, setStatusFilter] = useState("approved");
  const { toast } = useToast();

  // Get leave requests
  const { data: leaveRequests = [], isLoading, isError, error } = useQuery<LeaveRequest[]>({
    queryKey: ['/api/leave-requests'],
    retry: false,
  });

  // Get employees
  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ['/api/employees'],
    retry: false,
  });

  // Handle error
  React.useEffect(() => {
    if (isError && error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isError, error, toast]);

  // Filter leave requests based on status
  const filteredLeaveRequests = leaveRequests.filter(request => {
    if (statusFilter === "all") return true;
    if (statusFilter === "approved") return request.status === "APPROVED";
    if (statusFilter === "pending") return request.status === "SUBMITTED";
    return false;
  });

  // Combine leave requests with employee data
  const leaveRequestsWithEmployees = filteredLeaveRequests.map(request => ({
    ...request,
    employee: employees.find(emp => emp.id === request.employeeId) as Employee
  })).filter(request => request.employee);

  // Generate calendar days
  const generateCalendarDays = (): CalendarDay[] => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    
    return days.map(date => {
      const dayLeaveRequests = leaveRequestsWithEmployees.filter(request => {
        const startDate = parseISO(request.startDate);
        const endDate = parseISO(request.endDate);
        return date >= startDate && date <= endDate;
      });

      return {
        date,
        isCurrentMonth: isSameMonth(date, currentDate),
        leaveRequests: dayLeaveRequests,
      };
    });
  };

  const calendarDays = generateCalendarDays();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-300";
      case "SUBMITTED":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleExport = () => {
    toast({
      title: "Export Calendar",
      description: "Calendar export feature would be implemented here",
    });
  };

  // Calculate stats for the current month
  const monthStats = {
    totalOnLeave: leaveRequestsWithEmployees.filter(request => {
      const startDate = parseISO(request.startDate);
      const endDate = parseISO(request.endDate);
      const today = new Date();
      return today >= startDate && today <= endDate && request.status === "APPROVED";
    }).length,
    upcomingLeave: leaveRequestsWithEmployees.filter(request => {
      const startDate = parseISO(request.startDate);
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return startDate >= today && startDate <= nextWeek && request.status === "APPROVED";
    }).length,
    pendingApprovals: leaveRequestsWithEmployees.filter(request => 
      request.status === "SUBMITTED"
    ).length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="team-calendar-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" data-testid="text-calendar-title">
            Team Calendar
          </h1>
          <p className="text-muted-foreground mt-2">
            View team leave schedule and availability
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserX className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">On Leave Today</p>
                <p className="text-2xl font-bold" data-testid="text-on-leave-today">
                  {monthStats.totalOnLeave}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Upcoming This Week</p>
                <p className="text-2xl font-bold" data-testid="text-upcoming-leave">
                  {monthStats.upcomingLeave}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Users className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Approvals</p>
                <p className="text-2xl font-bold" data-testid="text-pending-approvals">
                  {monthStats.pendingApprovals}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold min-w-[200px] text-center">
              {format(currentDate, "MMMM yyyy")}
            </h2>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={handleToday}>
            Today
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approved">Approved Only</SelectItem>
                <SelectItem value="pending">Pending Only</SelectItem>
                <SelectItem value="all">All Requests</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5" />
            {format(currentDate, "MMMM yyyy")} Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="p-3 text-center font-semibold text-sm bg-gray-50 border-r last:border-r-0">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`min-h-[120px] p-2 border-r border-b last:border-r-0 ${
                  !day.isCurrentMonth ? "bg-gray-50" : ""
                } ${isToday(day.date) ? "bg-blue-50" : ""} ${
                  isWeekend(day.date) ? "bg-gray-25" : ""
                }`}
              >
                <div className={`text-sm font-medium mb-2 ${
                  !day.isCurrentMonth ? "text-gray-400" : 
                  isToday(day.date) ? "text-blue-600 font-bold" : "text-gray-900"
                }`}>
                  {format(day.date, "d")}
                </div>
                
                <div className="space-y-1">
                  {day.leaveRequests.slice(0, 3).map((request, reqIndex) => (
                    <TooltipProvider key={reqIndex}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`text-xs p-1 rounded border cursor-pointer ${getStatusColor(request.status)}`}
                            data-testid={`leave-request-${request.id}`}
                          >
                            <div className="font-medium truncate">
                              {request.employee?.firstName} {request.employee?.lastName}
                            </div>
                            <div className="truncate opacity-75">
                              {request.quantity} {request.unit.toLowerCase()}
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            <div className="font-semibold">
                              {request.employee?.firstName} {request.employee?.lastName}
                            </div>
                            <div>
                              {format(parseISO(request.startDate), "MMM dd")} - {format(parseISO(request.endDate), "MMM dd")}
                            </div>
                            <div>
                              {request.quantity} {request.unit.toLowerCase()}
                            </div>
                            <div>
                              Status: <span className="capitalize">{request.status.toLowerCase()}</span>
                            </div>
                            {request.reason && (
                              <div className="text-sm opacity-75">
                                Reason: {request.reason}
                              </div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                  
                  {day.leaveRequests.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{day.leaveRequests.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
              <span className="text-sm">Approved Leave</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
              <span className="text-sm">Pending Approval</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
              <span className="text-sm">Rejected</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div>
              <span className="text-sm">Today</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-25 border border-gray-200 rounded"></div>
              <span className="text-sm">Weekend</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}