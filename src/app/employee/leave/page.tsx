"use client"

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
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
import AuthGuard from "@/components/auth/auth-guard";
import EmployeeLayout from "@/components/layout/employee-layout";

export default function LeavePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showNewPolicy, setShowNewPolicy] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get leave requests
  const { data: leaveRequests = [], isLoading, isError, error } = useQuery({
    queryKey: ['/api/leave-requests'],
    retry: false,
  });

  // Get employees for reference
  const { data: employees = [] } = useQuery({
    queryKey: ['/api/people'],
    retry: false,
  });

  // Get leave balance for selected employee
  const { data: leaveBalance = [] } = useQuery({
    queryKey: ['/api/people', selectedRequest?.employeeId, 'leave-balance'],
    enabled: !!selectedRequest?.employeeId,
    retry: false,
  });

  // Update leave request status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: string; reason?: string }) => {
      const response = await fetch(`/api/leave-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason }),
      });
      if (!response.ok) throw new Error('Failed to update');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/leave-requests'] });
      toast({
        title: "Success",
        description: "Leave request status updated successfully",
      });
      setShowDetails(false);
      setSelectedRequest(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update leave request status",
        variant: "destructive",
      });
    },
  });

  // Filter leave requests
  const filteredRequests = leaveRequests.filter((request: any) => {
    const matchesSearch = request.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = (id: string, status: string, reason?: string) => {
    updateStatusMutation.mutate({ id, status, reason });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'SUBMITTED': { label: 'Pending', variant: 'secondary', color: 'bg-yellow-100 text-yellow-800' },
      'APPROVED': { label: 'Approved', variant: 'default', color: 'bg-green-100 text-green-800' },
      'REJECTED': { label: 'Rejected', variant: 'destructive', color: 'bg-red-100 text-red-800' },
      'CANCELLED': { label: 'Cancelled', variant: 'secondary', color: 'bg-gray-100 text-gray-800' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['SUBMITTED'];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find((emp: any) => emp.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown Employee';
  };

  if (isLoading) {
    return (
      <AuthGuard requireEmployee={true}>
        <EmployeeLayout>
          <div className="flex items-center justify-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </EmployeeLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireEmployee={true}>
      <EmployeeLayout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Leave Management</h2>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setShowNewPolicy(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Policy
              </Button>
              <Button>
                <Calendar className="mr-2 h-4 w-4" />
                Calendar View
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search leave requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Status</option>
              <option value="SUBMITTED">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Leave Requests Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plane className="mr-2 h-5 w-5" />
                Leave Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request: any) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {getEmployeeName(request.employeeId)}
                      </TableCell>
                      <TableCell>{request.leaveType}</TableCell>
                      <TableCell>{format(new Date(request.startDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{format(new Date(request.endDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        {differenceInDays(new Date(request.endDate), new Date(request.startDate)) + 1}
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedRequest(request);
                              setShowDetails(true);
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {request.status === 'SUBMITTED' && (
                              <>
                                <DropdownMenuItem onClick={() => handleStatusUpdate(request.id, 'APPROVED')}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusUpdate(request.id, 'REJECTED')}>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Leave Request Details Dialog */}
          <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Leave Request Details</DialogTitle>
                <DialogDescription>
                  Review the details of this leave request
                </DialogDescription>
              </DialogHeader>
              {selectedRequest && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Employee</label>
                      <p className="text-sm">{getEmployeeName(selectedRequest.employeeId)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Leave Type</label>
                      <p className="text-sm">{selectedRequest.leaveType}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                      <p className="text-sm">{format(new Date(selectedRequest.startDate), 'MMM dd, yyyy')}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">End Date</label>
                      <p className="text-sm">{format(new Date(selectedRequest.endDate), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Reason</label>
                    <p className="text-sm">{selectedRequest.reason}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDetails(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* New Policy Dialog */}
          <NewPolicyDialog open={showNewPolicy} onOpenChange={setShowNewPolicy} />
      </div>
      </EmployeeLayout>
    </AuthGuard>
  );
}
