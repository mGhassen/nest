import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import PasswordManagementDialog from "@/components/employees/password-management-dialog";
import NewLeaveRequestForm from "@/components/employees/new-leave-request-form";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, DollarSign, Clock, FileText, User, Building, Lock, Shield, Plane, CheckCircle, XCircle, AlertCircle, Plus, Check, X } from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import type { Employee, LeaveRequest, LeaveBalance } from "@shared/schema";

export default function EmployeeDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [newLeaveDialogOpen, setNewLeaveDialogOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Fetch employee payroll documents
  const { data: payrollDocuments = [], isLoading: documentsLoading, refetch: refetchDocuments } = useQuery<any[]>({
    queryKey: ['/api/employees', id, 'payroll-documents'],
    queryFn: () => fetch(`/api/employees/${id}/payroll-documents`, { credentials: 'include' }).then(res => res.json()),
    enabled: !!id,
  });

  // Generate month options for current and past 24 months
  const getMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    for (let i = 0; i < 24; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthStr = month.toString().padStart(2, '0');
      const value = `${year}-${monthStr}`;
      const label = `${date.toLocaleString('default', { month: 'long' })} ${year}`;
      options.push({ value, label, year, month: monthStr });
    }
    return options;
  };

  // Group documents by month
  const groupedDocuments = payrollDocuments.reduce((groups: Record<string, any[]>, doc: any) => {
    const monthKey = doc.payrollMonth;
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(doc);
    return groups;
  }, {});

  // Sort months in descending order
  const sortedMonthKeys = Object.keys(groupedDocuments).sort((a, b) => b.localeCompare(a));

  const { data: employee, isLoading, error } = useQuery<Employee>({
    queryKey: ['/api/employees', id],
    queryFn: () => fetch(`/api/employees/${id}`, { credentials: 'include' }).then(res => res.json()),
    enabled: !!id,
  });

  // Fetch employee leave requests
  const { data: leaveRequests = [], isLoading: leaveLoading } = useQuery<LeaveRequest[]>({
    queryKey: ['/api/employees', id, 'leave-requests'],
    queryFn: () => fetch(`/api/employees/${id}/leave-requests`, { credentials: 'include' }).then(res => res.json()),
    enabled: !!id,
  });

  // Fetch employee leave balance
  const { data: leaveBalance = [], isLoading: balanceLoading } = useQuery<LeaveBalance[]>({
    queryKey: ['/api/employees', id, 'leave-balance'],
    queryFn: () => fetch(`/api/employees/${id}/leave-balance`, { credentials: 'include' }).then(res => res.json()),
    enabled: !!id,
  });

  // Approve leave request mutation
  const approveLeaveRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      return await apiRequest('PATCH', `/api/leave-requests/${requestId}`, { status: 'APPROVED' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employees', id, 'leave-requests'] });
      toast({
        title: "Leave Request Approved",
        description: "The leave request has been approved successfully.",
      });
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
        description: "Failed to approve leave request",
        variant: "destructive",
      });
    },
  });

  // Reject leave request mutation
  const rejectLeaveRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      return await apiRequest('PATCH', `/api/leave-requests/${requestId}`, { status: 'REJECTED' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employees', id, 'leave-requests'] });
      toast({
        title: "Leave Request Rejected",
        description: "The leave request has been rejected.",
      });
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
        description: "Failed to reject leave request",
        variant: "destructive",
      });
    },
  });

  // Handle unauthorized errors
  if (error && isUnauthorizedError(error as Error)) {
    toast({
      title: "Unauthorized",
      description: "You are logged out. Logging in again...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Employee Not Found</h1>
        <p className="text-muted-foreground mb-6">The employee you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button onClick={() => navigate("/employees")} data-testid="button-back-to-employees">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Employees
        </Button>
      </div>
    );
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      INACTIVE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    };
    return statusColors[status as keyof typeof statusColors] || statusColors.ACTIVE;
  };

  return (
    <div className="p-6" data-testid="employee-detail-page">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/employees")}
            data-testid="button-back"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Employees
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="text-lg font-semibold">
                {getInitials(employee.firstName, employee.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold" data-testid="employee-name">
                {employee.firstName} {employee.lastName}
              </h1>
              <p className="text-muted-foreground" data-testid="employee-position">
                {employee.positionTitle}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPasswordDialogOpen(true)}
            data-testid="button-set-password"
          >
            <Lock className="mr-2 h-4 w-4" />
            Set Password
          </Button>
          <Badge className={getStatusBadge('ACTIVE')} data-testid="employee-status">
            ACTIVE
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="documents" data-testid="tab-documents">Documents</TabsTrigger>
          <TabsTrigger value="administrative" data-testid="tab-administrative">Administrative</TabsTrigger>
          <TabsTrigger value="absence" data-testid="tab-absence">Absence/Leave</TabsTrigger>
          <TabsTrigger value="payroll" data-testid="tab-payroll">Payroll</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span data-testid="employee-email">{employee.email}</span>
                </div>



              </CardContent>
            </Card>

            {/* Employment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="mr-2 h-5 w-5" />
                  Employment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span data-testid="employee-hire-date">
                    Hired: {format(new Date(employee.hireDate), 'MMM dd, yyyy')}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span data-testid="employee-type">{employee.employmentType.replace('_', ' ')}</span>
                </div>

                {employee.managerId && (
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span data-testid="employee-manager">Manager ID: {employee.managerId}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Compensation */}
          {(employee.baseSalary || employee.hourlyRate) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Compensation
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {employee.baseSalary && (
                  <div data-testid="employee-salary">
                    <p className="text-sm font-medium text-muted-foreground">Base Salary</p>
                    <p className="text-2xl font-bold">
                      ${employee.baseSalary.toLocaleString()} 
                      <span className="text-sm font-normal text-muted-foreground">
                        /{employee.salaryPeriod?.toLowerCase()}
                      </span>
                    </p>
                  </div>
                )}
                {employee.hourlyRate && (
                  <div data-testid="employee-hourly-rate">
                    <p className="text-sm font-medium text-muted-foreground">Hourly Rate</p>
                    <p className="text-2xl font-bold">${employee.hourlyRate}/hour</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Employee Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Documents Yet</h3>
                <p className="text-muted-foreground mb-4">Employee documents will appear here once uploaded.</p>
                <Button variant="outline" data-testid="button-upload-document">
                  Upload Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Administrative Tab */}
        <TabsContent value="administrative">
          <Card>
            <CardHeader>
              <CardTitle>Administrative Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Employee Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Employee ID:</span>
                      <span data-testid="employee-id">{employee.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span data-testid="employee-created">
                        {employee.createdAt ? format(new Date(employee.createdAt), 'MMM dd, yyyy') : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated:</span>
                      <span data-testid="employee-updated">
                        {employee.updatedAt ? format(new Date(employee.updatedAt), 'MMM dd, yyyy') : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">System Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge className={getStatusBadge('ACTIVE')} data-testid="admin-employee-status">
                        ACTIVE
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Absence/Leave Tab */}
        <TabsContent value="absence">
          <div className="space-y-6">
            {/* Leave Balance Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Leave Balance Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {balanceLoading ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                ) : leaveBalance.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {leaveBalance.map((balance) => (
                      <div key={balance.id} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-blue-900">{balance.policyCode}</h4>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {balance.unit?.toLowerCase() || 'days'}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-blue-700">Available:</span>
                            <span className="font-medium text-blue-900">{balance.currentBalance}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700">Used:</span>
                            <span className="font-medium text-blue-900">{balance.used}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700">Total:</span>
                            <span className="font-medium text-blue-900">{balance.accrued}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Calendar className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No leave balance records available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Leave Requests History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Plane className="mr-2 h-5 w-5" />
                    Leave Requests History
                  </span>
                  <Dialog open={newLeaveDialogOpen} onOpenChange={setNewLeaveDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" data-testid="button-add-leave">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Leave Request
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create Leave Request for {employee?.firstName} {employee?.lastName}</DialogTitle>
                      </DialogHeader>
                      <NewLeaveRequestForm 
                        employeeId={id || ''} 
                        onSuccess={() => setNewLeaveDialogOpen(false)}
                        onCancel={() => setNewLeaveDialogOpen(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leaveLoading ? (
                  <div className="animate-pulse space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : leaveRequests.length > 0 ? (
                  <div className="space-y-4">
                    {leaveRequests.map((request) => {
                      const startDate = parseISO(request.startDate);
                      const endDate = parseISO(request.endDate);
                      const duration = differenceInDays(endDate, startDate) + 1;
                      
                      const getStatusIcon = (status: string) => {
                        switch (status) {
                          case "APPROVED":
                            return <CheckCircle className="h-5 w-5 text-green-600" />;
                          case "REJECTED":
                            return <XCircle className="h-5 w-5 text-red-600" />;
                          case "SUBMITTED":
                            return <AlertCircle className="h-5 w-5 text-yellow-600" />;
                          default:
                            return <Clock className="h-5 w-5 text-gray-600" />;
                        }
                      };

                      const getStatusColor = (status: string) => {
                        switch (status) {
                          case "APPROVED":
                            return "bg-green-100 text-green-800 border-green-300";
                          case "REJECTED":
                            return "bg-red-100 text-red-800 border-red-300";
                          case "SUBMITTED":
                            return "bg-yellow-100 text-yellow-800 border-yellow-300";
                          default:
                            return "bg-gray-100 text-gray-800 border-gray-300";
                        }
                      };

                      return (
                        <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              {getStatusIcon(request.status)}
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h4 className="font-medium">{request.policyCode} Leave</h4>
                                  <Badge className={`${getStatusColor(request.status)} border`}>
                                    {request.status.toLowerCase()}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                                  <div>
                                    <span className="font-medium">Duration:</span> {duration} {duration === 1 ? 'day' : 'days'}
                                  </div>
                                  <div>
                                    <span className="font-medium">Dates:</span> {format(startDate, 'MMM dd')} - {format(endDate, 'MMM dd, yyyy')}
                                  </div>
                                  <div>
                                    <span className="font-medium">Amount:</span> {request.quantity} {request.unit?.toLowerCase() || 'days'}
                                  </div>
                                </div>
                                {request.reason && (
                                  <div className="mt-2">
                                    <span className="text-sm font-medium text-muted-foreground">Reason:</span>
                                    <p className="text-sm mt-1">{request.reason}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end space-y-2">
                              <div className="text-right text-sm text-muted-foreground">
                                <div>Submitted: {request.createdAt ? format(parseISO(request.createdAt), 'MMM dd, yyyy') : 'N/A'}</div>
                                {request.approvedAt && (
                                  <div>Approved: {format(parseISO(request.approvedAt), 'MMM dd, yyyy')}</div>
                                )}
                              </div>
                              {request.status === 'SUBMITTED' && (
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600 border-green-300 hover:bg-green-50"
                                    onClick={() => approveLeaveRequestMutation.mutate(request.id)}
                                    disabled={approveLeaveRequestMutation.isPending}
                                    data-testid={`button-approve-${request.id}`}
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 border-red-300 hover:bg-red-50"
                                    onClick={() => rejectLeaveRequestMutation.mutate(request.id)}
                                    disabled={rejectLeaveRequestMutation.isPending}
                                    data-testid={`button-reject-${request.id}`}
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Plane className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Leave Requests</h3>
                    <p className="text-muted-foreground mb-4">This employee hasn't submitted any leave requests yet.</p>
                    <Dialog open={newLeaveDialogOpen} onOpenChange={setNewLeaveDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" data-testid="button-create-leave">
                          <Plus className="mr-2 h-4 w-4" />
                          Create Leave Request
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Create Leave Request for {employee?.firstName} {employee?.lastName}</DialogTitle>
                        </DialogHeader>
                        <NewLeaveRequestForm 
                          employeeId={id || ''} 
                          onSuccess={() => setNewLeaveDialogOpen(false)}
                          onCancel={() => setNewLeaveDialogOpen(false)}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Payroll Tab */}
        <TabsContent value="payroll">
          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Payroll Documents</h2>
                <p className="text-sm text-gray-600 mt-1">Manage employee payroll documents and pay stubs</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gray-900 text-white hover:bg-gray-800 px-4 py-2 text-sm font-medium rounded-md" data-testid="button-upload-payroll">
                    <Plus className="mr-2 h-4 w-4" />
                    Upload Document
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader className="text-center pb-4">
                    <DialogTitle className="text-xl font-semibold text-gray-900">Add Payroll Document</DialogTitle>
                    <p className="text-sm text-gray-500 mt-2">
                      Upload a payroll document for {employee?.firstName} {employee?.lastName}
                    </p>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    {/* Step 1: Month Selection */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-medium">
                          1
                        </div>
                        <label className="text-sm font-medium text-gray-900">
                          Select Payroll Period
                        </label>
                      </div>
                      <Select value={selectedMonth} onValueChange={(value) => {
                        setSelectedMonth(value);
                        const [year] = value.split('-');
                        setSelectedYear(parseInt(year));
                      }}>
                        <SelectTrigger data-testid="select-payroll-month" className="w-full h-11 border-gray-300 focus:border-gray-900 focus:ring-gray-900">
                          <SelectValue placeholder="Choose the payroll month and year" />
                        </SelectTrigger>
                        <SelectContent>
                          {getMonthOptions().map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center justify-between w-full">
                                <span>{option.label}</span>
                                {/* Show if document already exists for this month */}
                                {payrollDocuments.some(doc => doc.payrollMonth === option.value) && (
                                  <span className="ml-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                                    Has documents
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedMonth && (
                        <div className="flex items-center text-sm text-green-600 bg-green-50 p-2 rounded-lg">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Period selected: {getMonthOptions().find(opt => opt.value === selectedMonth)?.label}
                        </div>
                      )}
                    </div>

                    {/* Step 2: File Upload */}
                    {selectedMonth && (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-medium">
                            2
                          </div>
                          <label className="text-sm font-medium text-gray-900">
                            Upload Document
                          </label>
                        </div>
                        
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                          <ObjectUploader
                            maxNumberOfFiles={1}
                            maxFileSize={10485760} // 10MB
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                            onGetUploadParameters={async () => {
                              const response = await fetch('/api/objects/upload', {
                                method: 'POST',
                                credentials: 'include',
                              });
                              const data = await response.json();
                              return { method: 'PUT' as const, url: data.uploadURL };
                            }}
                            onComplete={async (uploadedFile) => {
                              try {
                                await apiRequest('PUT', `/api/employees/${id}/payroll-documents`, {
                                  documentUrl: uploadedFile.url,
                                  fileName: uploadedFile.name,
                                  payrollMonth: selectedMonth,
                                  payrollYear: selectedYear,
                                  uploadedAt: new Date().toISOString(),
                                });
                                
                                await refetchDocuments();
                                queryClient.invalidateQueries({ queryKey: [`/api/employees/${id}/payroll-documents`] });
                                setSelectedMonth('');
                                
                                toast({
                                  title: "Document uploaded successfully",
                                  description: `${uploadedFile.name} has been added to ${getMonthOptions().find(opt => opt.value === selectedMonth)?.label} payroll records.`,
                                });
                              } catch (error) {
                                console.error('Error saving document:', error);
                                toast({
                                  title: "Upload failed",
                                  description: "Document uploaded but failed to save record. Please try again.",
                                  variant: "destructive",
                                });
                              }
                            }}
                            buttonClassName="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 h-12 font-medium"
                          >
                            <div className="flex flex-col items-center space-y-2">
                              <FileText className="w-6 h-6 text-gray-400" />
                              <div className="text-center">
                                <div className="font-medium">Choose file to upload</div>
                                <div className="text-xs text-gray-500">PDF, DOC, DOCX, XLS, XLSX, TXT (max 10MB)</div>
                              </div>
                            </div>
                          </ObjectUploader>
                        </div>

                        <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                            </div>
                            <div>
                              <div className="font-medium text-blue-900 mb-1">Document Guidelines</div>
                              <ul className="space-y-1 text-blue-700">
                                <li>• Ensure document contains payroll information for the selected period</li>
                                <li>• Files are automatically encrypted and stored securely</li>
                                <li>• Multiple documents can be uploaded for the same period</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Content */}
            <div className="bg-white border border-gray-200 rounded-lg">
              {documentsLoading ? (
                <div className="p-6">
                  <div className="animate-pulse space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-12 bg-gray-100 rounded"></div>
                    ))}
                  </div>
                </div>
              ) : payrollDocuments.length > 0 ? (
                <div className="space-y-6">
                  {/* Documents organized by month */}
                  {sortedMonthKeys.map((monthKey, monthIndex) => {
                    const monthDocs = groupedDocuments[monthKey];
                    const [year, month] = monthKey.split('-');
                    const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long' });
                    
                    return (
                      <div key={monthKey} className={monthIndex === 0 ? '' : 'pt-6'}>
                        {/* Month Header */}
                        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900">
                              {monthName} {year}
                            </h3>
                            <div className="text-sm text-gray-500">
                              {monthDocs.length} {monthDocs.length === 1 ? 'document' : 'documents'}
                            </div>
                          </div>
                        </div>

                        {/* Documents for this month */}
                        <div className="divide-y divide-gray-100">
                          {monthDocs.map((doc: any) => (
                            <div key={doc.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  {/* File Icon */}
                                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                  </div>

                                  {/* Document Info */}
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{doc.fileName}</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      Uploaded {doc.uploadedAt ? format(parseISO(doc.uploadedAt), 'MMM dd, yyyy at h:mm a') : 'Unknown date'}
                                    </div>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs"
                                    onClick={() => window.open(doc.documentUrl, '_blank')}
                                    data-testid={`button-view-${doc.id}`}
                                  >
                                    View
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs"
                                    onClick={() => {
                                      const link = document.createElement('a');
                                      link.href = doc.documentUrl;
                                      link.download = doc.fileName;
                                      link.click();
                                    }}
                                    data-testid={`button-download-${doc.id}`}
                                  >
                                    Download
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No payroll documents</h3>
                  <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                    Upload payroll documents, pay stubs, and related files to keep employee records organized by month.
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-gray-900 text-white hover:bg-gray-800 px-4 py-2 text-sm font-medium rounded-md">
                        <Plus className="mr-2 h-4 w-4" />
                        Upload First Document
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-lg font-semibold text-gray-900">Upload Payroll Document</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Select Month</label>
                          <Select value={selectedMonth} onValueChange={(value) => {
                            setSelectedMonth(value);
                            const [year] = value.split('-');
                            setSelectedYear(parseInt(year));
                          }}>
                            <SelectTrigger data-testid="select-payroll-month-empty" className="w-full border-gray-300">
                              <SelectValue placeholder="Choose payroll month" />
                            </SelectTrigger>
                            <SelectContent>
                              {getMonthOptions().map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedMonth && (
                          <ObjectUploader
                            maxNumberOfFiles={1}
                            maxFileSize={10485760} // 10MB
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                            onGetUploadParameters={async () => {
                              const response = await fetch('/api/objects/upload', {
                                method: 'POST',
                                credentials: 'include',
                              });
                              const data = await response.json();
                              return { method: 'PUT' as const, url: data.uploadURL };
                            }}
                            onComplete={async (uploadedFile) => {
                              try {
                                await apiRequest('PUT', `/api/employees/${id}/payroll-documents`, {
                                  documentUrl: uploadedFile.url,
                                  fileName: uploadedFile.name,
                                  payrollMonth: selectedMonth,
                                  payrollYear: selectedYear,
                                  uploadedAt: new Date().toISOString(),
                                });
                                
                                await refetchDocuments();
                                queryClient.invalidateQueries({ queryKey: [`/api/employees/${id}/payroll-documents`] });
                                setSelectedMonth('');
                                
                                toast({
                                  title: "Document uploaded",
                                  description: `${uploadedFile.name} has been added to ${selectedMonth} payroll.`,
                                });
                              } catch (error) {
                                console.error('Error saving document:', error);
                                toast({
                                  title: "Error",
                                  description: "Document uploaded but failed to save record.",
                                  variant: "destructive",
                                });
                              }
                            }}
                            buttonClassName="w-full bg-gray-900 hover:bg-gray-800 text-white"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Upload Document for {getMonthOptions().find(opt => opt.value === selectedMonth)?.label}
                          </ObjectUploader>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Password Management Dialog */}
      <PasswordManagementDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
        employeeId={employee.id}
        employeeName={`${employee.firstName} ${employee.lastName}`}
      />
    </div>
  );
}