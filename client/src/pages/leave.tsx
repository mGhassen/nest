import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Calendar, 
  Search, 
  Filter,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Eye,
  Plane,
  TrendingUp,
  AlertCircle,
  History,
  Plus
} from "lucide-react";
import NewPolicyDialog from "@/components/leave/new-policy-dialog";
import { format, differenceInDays, isBefore } from "date-fns";
import type { LeaveRequest, Employee } from "@shared/schema";

export default function Leave() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get leave requests - using the working endpoint
  const { data: leaveRequests = [], isLoading, isError, error } = useQuery<LeaveRequest[]>({
    queryKey: ['/api/leave-requests'],
    retry: false,
  });

  // Handle error in useEffect
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

  // Get employees for reference
  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ['/api/employees'],
    retry: false,
  });

  // Get leave balance for selected employee
  const { data: leaveBalance = [] } = useQuery({
    queryKey: ['/api/employees', selectedRequest?.employeeId, 'leave-balance'],
    enabled: !!selectedRequest?.employeeId,
    retry: false,
  });

  // Update leave request status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: string; reason?: string }) => {
      return await apiRequest('PATCH', `/api/leave-requests/${id}`, { status, reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/leave-requests'] });
      toast({
        title: "Success",
        description: "Leave request status updated successfully",
      });
      setShowDetails(false);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to update leave request status",
        variant: "destructive",
      });
    },
  });

  // Calculate statistics
  const today = new Date();
  const pendingRequests = (leaveRequests as LeaveRequest[]).filter((r: LeaveRequest) => r.status === 'SUBMITTED');
  const recentRequests = (leaveRequests as LeaveRequest[]).filter((r: LeaveRequest) => {
    const startDate = new Date(r.startDate);
    const daysDiff = differenceInDays(today, startDate);
    return daysDiff >= -30 && daysDiff <= 7; // 30 days future to 7 days past
  });
  const historyRequests = (leaveRequests as LeaveRequest[]).filter((r: LeaveRequest) => {
    const endDate = new Date(r.endDate);
    return isBefore(endDate, today) && differenceInDays(today, endDate) > 7;
  });
  const approvedRequests = (leaveRequests as LeaveRequest[]).filter((r: LeaveRequest) => r.status === 'APPROVED');

  // Filter requests based on search and status
  const filteredRequests = (leaveRequests as LeaveRequest[]).filter((request: LeaveRequest) => {
    const employee = employees.find(e => e.id === request.employeeId);
    const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : '';
    
    const matchesSearch = searchTerm === '' || 
      employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.reason && request.reason.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      'DRAFT': 'bg-gray-100 text-gray-800',
      'SUBMITTED': 'bg-yellow-100 text-yellow-800',
      'APPROVED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800',
    };
    
    return (
      <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {status.toLowerCase()}
      </Badge>
    );
  };

  const handleApprove = (request: LeaveRequest) => {
    updateStatusMutation.mutate({ 
      id: request.id, 
      status: 'APPROVED',
      reason: 'Approved by administrator'
    });
  };

  const handleReject = (request: LeaveRequest) => {
    updateStatusMutation.mutate({ 
      id: request.id, 
      status: 'REJECTED',
      reason: 'Rejected by administrator'
    });
  };

  const getDaysDifference = (startDate: string) => {
    const start = new Date(startDate);
    const diff = differenceInDays(start, today);
    if (diff > 0) return `In ${diff} days`;
    if (diff < 0) return `${Math.abs(diff)} days ago`;
    return 'Today';
  };

  const handleViewCalendar = () => {
    window.location.href = "/team-calendar";
  };

  const handleNewPolicy = () => {
    toast({
      title: "New Policy",
      description: "Leave policy creation form would open here",
    });
  };

  const RequestsTable = ({ requests, title }: { requests: LeaveRequest[], title: string }) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Plane className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No {title.toLowerCase()} found</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => {
                  const employee = employees.find(e => e.id === request.employeeId);
                  const startDate = new Date(request.startDate);
                  const endDate = new Date(request.endDate);
                  const duration = differenceInDays(endDate, startDate) + 1;
                  
                  return (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {employee?.positionTitle || 'No position'}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {format(new Date(request.startDate), 'MMM dd')} - {format(new Date(request.endDate), 'MMM dd, yyyy')}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {getDaysDifference(request.startDate)}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="font-medium">{request.quantity} {request.unit.toLowerCase()}</div>
                        <div className="text-sm text-muted-foreground">{duration} calendar days</div>
                      </TableCell>
                      
                      <TableCell>
                        {getStatusBadge(request.status)}
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          {request.createdAt ? format(new Date(request.createdAt), 'MMM dd, yyyy') : 'N/A'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {request.createdAt ? format(new Date(request.createdAt), 'HH:mm') : 'N/A'}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowDetails(true);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {request.status === 'SUBMITTED' && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => handleApprove(request)}
                                  className="text-green-600"
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleReject(request)}
                                  className="text-red-600"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="leave-management-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" data-testid="text-page-title">
            Leave Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Review and manage employee leave requests
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleViewCalendar}>
            <Calendar className="mr-2 h-4 w-4" />
            Team Calendar
          </Button>
          <NewPolicyDialog />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
                <p className="text-2xl font-bold" data-testid="text-pending-requests">
                  {pendingRequests.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold" data-testid="text-approved-requests">
                  {approvedRequests.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recent Requests</p>
                <p className="text-2xl font-bold" data-testid="text-recent-requests">
                  {recentRequests.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold" data-testid="text-total-requests">
                  {leaveRequests.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by employee name or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-requests"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Status: {statusFilter === 'all' ? 'All' : statusFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter('all')}>
              All Statuses
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('SUBMITTED')}>
              Pending
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('APPROVED')}>
              Approved
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('REJECTED')}>
              Rejected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Recent ({recentRequests.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History ({historyRequests.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Plane className="h-4 w-4" />
            All ({filteredRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <RequestsTable 
            requests={pendingRequests.filter(r => 
              searchTerm === '' || 
              employees.find(e => e.id === r.employeeId)?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              employees.find(e => e.id === r.employeeId)?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (r.reason && r.reason.toLowerCase().includes(searchTerm.toLowerCase()))
            )} 
            title="Pending Approval" 
          />
        </TabsContent>

        <TabsContent value="recent" className="mt-6">
          <RequestsTable 
            requests={recentRequests.filter(r => 
              searchTerm === '' || 
              employees.find(e => e.id === r.employeeId)?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              employees.find(e => e.id === r.employeeId)?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (r.reason && r.reason.toLowerCase().includes(searchTerm.toLowerCase()))
            )} 
            title="Recent Requests" 
          />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <RequestsTable 
            requests={historyRequests.filter(r => 
              searchTerm === '' || 
              employees.find(e => e.id === r.employeeId)?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              employees.find(e => e.id === r.employeeId)?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (r.reason && r.reason.toLowerCase().includes(searchTerm.toLowerCase()))
            )} 
            title="Leave History" 
          />
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <RequestsTable requests={filteredRequests} title="All Leave Requests" />
        </TabsContent>
      </Tabs>

      {/* Request Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl" data-testid="dialog-request-details">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
            <DialogDescription>
              Review and manage this leave request
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">EMPLOYEE</h4>
                    <div className="mt-1">
                      {(() => {
                        const employee = employees.find(e => e.id === selectedRequest.employeeId);
                        return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee';
                      })()}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">LEAVE PERIOD</h4>
                    <div className="mt-1">
                      {format(new Date(selectedRequest.startDate), 'MMMM dd, yyyy')} - {format(new Date(selectedRequest.endDate), 'MMMM dd, yyyy')}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">DURATION</h4>
                    <div className="mt-1">
                      {selectedRequest.quantity} {selectedRequest.unit.toLowerCase()}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">STATUS</h4>
                    <div className="mt-1">
                      {getStatusBadge(selectedRequest.status)}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">REQUEST DATE</h4>
                    <div className="mt-1">
                      {selectedRequest.createdAt ? format(new Date(selectedRequest.createdAt), 'MMMM dd, yyyy HH:mm') : 'N/A'}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">STARTS</h4>
                    <div className="mt-1">
                      {getDaysDifference(selectedRequest.startDate)}
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedRequest.reason && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">REASON</h4>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                    {selectedRequest.reason}
                  </div>
                </div>
              )}

              {/* Leave Balance Information */}
              {leaveBalance && leaveBalance.length > 0 && (
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-sm text-muted-foreground mb-3">LEAVE BALANCE</h4>
                  <div className="space-y-3">
                    {leaveBalance.map((balance: any) => (
                      <div key={balance.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-sm">Leave Policy</div>
                          <div className="text-xs text-muted-foreground">
                            Period: {format(new Date(balance.periodStart), 'MMM dd')} - {format(new Date(balance.periodEnd), 'MMM dd, yyyy')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg text-green-600">
                            {parseFloat(balance.closing || '0').toFixed(1)} days
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Available
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Summary */}
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-blue-900">Total Remaining Days:</span>
                      <span className="font-bold text-xl text-blue-600">
                        {leaveBalance.reduce((total: number, balance: any) => total + parseFloat(balance.closing || '0'), 0).toFixed(1)} days
                      </span>
                    </div>
                    
                    {selectedRequest && (
                      <div className="mt-2 pt-2 border-t border-blue-200">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-blue-700">After this request:</span>
                          <span className="font-semibold text-blue-800">
                            {(leaveBalance.reduce((total: number, balance: any) => total + parseFloat(balance.closing || '0'), 0) - parseFloat(selectedRequest.quantity)).toFixed(1)} days
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetails(false)}>
              Close
            </Button>
            {selectedRequest?.status === 'SUBMITTED' && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => selectedRequest && handleReject(selectedRequest)}
                  className="text-red-600 hover:text-red-700"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button 
                  onClick={() => selectedRequest && handleApprove(selectedRequest)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}