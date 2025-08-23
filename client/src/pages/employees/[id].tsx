import { useEffect } from "react";
import { useParams } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { hasPermission, canViewSalary } from "@/lib/rbac";
import { EMPLOYMENT_TYPES, SALARY_PERIODS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserAvatar from "@/components/common/user-avatar";
import { ArrowLeft, Edit2, Mail, Calendar, MapPin, Building2, Clock, DollarSign } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

export default function EmployeeDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

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

  const { data: employee, isLoading: employeeLoading, error } = useQuery({
    queryKey: ['/api/employees', id],
    enabled: !!id && isAuthenticated,
    retry: false,
  });

  useEffect(() => {
    if (error && isUnauthorizedError(error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [error, toast]);

  if (isLoading || !user || employeeLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Get the first company membership
  const membership = user.memberships?.[0];

  // Check if user has permission to view employees
  if (!hasPermission(membership, "employee:read")) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view employees.</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Employee Not Found</h2>
          <p className="text-gray-600">The employee you're looking for doesn't exist or you don't have access.</p>
          <Link href="/employees">
            <Button className="mt-4">Back to Employees</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getEmploymentTypeLabel = (type: string) => {
    return EMPLOYMENT_TYPES.find(t => t.value === type)?.label || type;
  };

  const getSalaryPeriodLabel = (period: string) => {
    return SALARY_PERIODS.find(p => p.value === period)?.label || period;
  };

  const canEdit = hasPermission(membership, "employee:update");
  const canViewEmployeeSalary = canViewSalary(membership, employee.id, employee.userId);

  return (
    <div className="p-6" data-testid="employee-detail">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link href="/employees">
                <Button variant="outline" size="sm" data-testid="button-back-to-employees">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Employees
                </Button>
              </Link>
            </div>
            {canEdit && (
              <Link href={`/employees/${employee.id}/edit`}>
                <Button data-testid="button-edit-employee">
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Employee
                </Button>
              </Link>
            )}
          </div>

          {/* Employee Header */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-start space-x-6">
              <UserAvatar
                user={{
                  firstName: employee.firstName,
                  lastName: employee.lastName,
                  email: employee.email,
                }}
                size="lg"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900" data-testid="text-employee-name">
                    {employee.firstName} {employee.lastName}
                  </h1>
                  <Badge variant={employee.terminationDate ? "secondary" : "default"} 
                         className={employee.terminationDate ? "" : "bg-green-100 text-green-800"}>
                    {employee.terminationDate ? "Inactive" : "Active"}
                  </Badge>
                </div>
                {employee.positionTitle && (
                  <p className="text-lg text-gray-600 mb-2">{employee.positionTitle}</p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    {employee.email}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Hired {format(new Date(employee.hireDate), "MMM dd, yyyy")}
                  </div>
                  <div className="flex items-center">
                    <Building2 className="w-4 h-4 mr-1" />
                    {getEmploymentTypeLabel(employee.employmentType)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="compensation">Compensation</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Basic employee details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="text-sm text-gray-900">{employee.firstName} {employee.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-sm text-gray-900">{employee.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Employment Type</label>
                    <p className="text-sm text-gray-900">{getEmploymentTypeLabel(employee.employmentType)}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Employment Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Employment Details</CardTitle>
                  <CardDescription>Role and organizational information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Position</label>
                    <p className="text-sm text-gray-900">{employee.positionTitle || "—"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Hire Date</label>
                    <p className="text-sm text-gray-900">
                      {format(new Date(employee.hireDate), "MMMM dd, yyyy")}
                    </p>
                  </div>
                  {employee.terminationDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Termination Date</label>
                      <p className="text-sm text-gray-900">
                        {format(new Date(employee.terminationDate), "MMMM dd, yyyy")}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Compensation Tab */}
          <TabsContent value="compensation" className="space-y-6">
            {canViewEmployeeSalary ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Salary Information</CardTitle>
                    <CardDescription>Current compensation details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Base Salary</label>
                      <p className="text-sm text-gray-900">
                        {employee.baseSalary ? (
                          `€${Number(employee.baseSalary).toLocaleString()}${
                            employee.salaryPeriod ? ` / ${getSalaryPeriodLabel(employee.salaryPeriod).toLowerCase()}` : ""
                          }`
                        ) : (
                          "—"
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Hourly Rate</label>
                      <p className="text-sm text-gray-900">
                        {employee.hourlyRate ? `€${Number(employee.hourlyRate).toFixed(2)}/hour` : "—"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Bank Account</CardTitle>
                    <CardDescription>Payment information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">No bank account information available</p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
                  <p className="text-gray-600">You don't have permission to view salary information.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Employee contracts and documents</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">No documents available</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Employee activity and audit trail</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">No recent activity</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
