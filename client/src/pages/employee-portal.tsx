import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { 
  User, 
  Clock, 
  Calendar, 
  FileText, 
  DollarSign, 
  Mail, 
  Phone, 
  MapPin,
  Building,
  Home,
  ClipboardList,
  Plane,
  Receipt,
  LogOut,
  Menu,
  Bell,
  Settings
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import type { Employee } from "@shared/schema";
import { LeaveRequestForm } from '@/components/leave/leave-request-form';
import { LeaveRequestsTable } from '@/components/leave/leave-requests-table';

export default function EmployeePortal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Get employee profile
  const { data: employee, isLoading } = useQuery<Employee>({
    queryKey: ['/api/employee/profile'],
    retry: false,
  });

  // Get recent timesheets
  const { data: recentTimesheets = [] } = useQuery<any[]>({
    queryKey: ['/api/employee/timesheets'],
    retry: false,
  });

  // Get leave requests
  const { data: leaveRequests = [] } = useQuery<any[]>({
    queryKey: ['/api/employee/leave-requests'],
    retry: false,
  });

  // Get payroll documents
  const { data: payrollDocs = [] } = useQuery<any[]>({
    queryKey: ['/api/employee/payroll-docs'],
    retry: false,
  });

  // Employee logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/auth/employee-logout");
    },
    onSuccess: () => {
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      window.location.href = "/auth";
    },
    onError: () => {
      // Force logout even if API call fails
      window.location.href = "/auth";
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "employees", label: "Employee Directory", icon: Users },
    { id: "timesheets", label: "Timesheets", icon: Clock },
    { id: "leave", label: "Leave Requests", icon: Plane },
    { id: "payroll", label: "Payroll", icon: Receipt },
    { id: "company", label: "Company Info", icon: Building2 },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse p-6 space-y-6">
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="flex">
            <div className="w-64 h-96 bg-gray-200 dark:bg-gray-700 rounded mr-6"></div>
            <div className="flex-1 h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Profile Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              Your employee profile is not set up yet. Please contact HR for assistance.
            </p>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome back, {employee.firstName}!</h2>
        <p className="text-muted-foreground">Here's an overview of your employee information.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Timesheets</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentTimesheets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leave Requests</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveRequests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payroll Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payrollDocs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Position</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">{employee.positionTitle || 'Not Set'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Employee Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {getInitials(employee.firstName, employee.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{employee.firstName} {employee.lastName}</h3>
              <p className="text-muted-foreground">{employee.positionTitle}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{employee.email}</span>
            </div>
            {(employee as any).phoneNumber && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{(employee as any).phoneNumber}</span>
              </div>
            )}
            {(employee as any).department && (
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>{(employee as any).department}</span>
              </div>
            )}
            {employee.hireDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Hired: {format(new Date(employee.hireDate), 'MMM dd, yyyy')}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "timesheets":
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">My Timesheets</h2>
            {recentTimesheets.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No timesheets found.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {recentTimesheets.map((timesheet: any) => (
                  <Card key={timesheet.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{timesheet.weekStarting}</h3>
                          <p className="text-sm text-muted-foreground">
                            {timesheet.totalHours} hours
                          </p>
                        </div>
                        <Badge variant={timesheet.status === 'approved' ? 'default' : 'secondary'}>
                          {timesheet.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );
      case "leave":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight">Leave & Time Off</h2>
              <LeaveRequestForm onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ['/api/employee/leave-requests'] });
              }} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Requests</p>
                      <p className="text-2xl font-bold">{leaveRequests.length}</p>
                      <p className="text-xs text-muted-foreground">This year</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Clock className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Approved</p>
                      <p className="text-2xl font-bold">
                        {leaveRequests.filter((r: any) => r.status === 'APPROVED').length}
                      </p>
                      <p className="text-xs text-muted-foreground">Approved requests</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Plane className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold">
                        {leaveRequests.filter((r: any) => r.status === 'SUBMITTED').length}
                      </p>
                      <p className="text-xs text-muted-foreground">Awaiting approval</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Your Leave Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <LeaveRequestsTable requests={leaveRequests} />
              </CardContent>
            </Card>
          </div>
        );
      case "employees":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Employee Directory</h2>
              <p className="text-muted-foreground">Browse and connect with your colleagues</p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Company Directory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Employee Directory</h3>
                  <p className="text-muted-foreground mb-4">
                    Access to the company directory helps you connect with colleagues across departments.
                  </p>
                  <div className="space-y-2 text-sm text-muted-foreground max-w-md mx-auto">
                    <p>• Find contact information for team members</p>
                    <p>• View department structures and reporting lines</p>
                    <p>• Access office locations and contact details</p>
                    <p>• See employee profiles and expertise areas</p>
                  </div>
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg max-w-lg mx-auto">
                    <p className="text-sm text-blue-700">
                      <strong>Coming Soon:</strong> Full directory access will be available in your next update.
                      For now, contact HR at hr@company.com for directory assistance.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case "payroll":
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Payroll Documents</h2>
            {payrollDocs.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No payroll documents available.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {payrollDocs.map((doc: any) => (
                  <Card key={doc.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{doc.title}</h3>
                          <p className="text-sm text-muted-foreground">{doc.period}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );
      case "company":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Company Information</h2>
              <p className="text-muted-foreground">Learn about our organization, policies, and culture</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    About Our Company
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Mission & Values</h4>
                    <p className="text-sm text-muted-foreground">
                      We're committed to building innovative solutions that make a difference.
                      Our values of integrity, collaboration, and excellence guide everything we do.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Company Culture</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>• Remote-first with flexible working arrangements</p>
                      <p>• Focus on work-life balance and employee wellbeing</p>
                      <p>• Continuous learning and professional development</p>
                      <p>• Open communication and feedback culture</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Policies & Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Employee Handbook</p>
                        <p className="text-xs text-muted-foreground">Policies and procedures</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Benefits Guide</p>
                        <p className="text-xs text-muted-foreground">Healthcare and perks</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">IT Policies</p>
                        <p className="text-xs text-muted-foreground">Technology usage guidelines</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Organization Structure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="font-semibold">Executive Team</div>
                    <div className="text-sm text-muted-foreground mt-1">Leadership & Strategy</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="font-semibold">Engineering</div>
                    <div className="text-sm text-muted-foreground mt-1">Product Development</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="font-semibold">Operations</div>
                    <div className="text-sm text-muted-foreground mt-1">Business Support</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16">
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">PayfitLite</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Employee Portal</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <Bell className="h-5 w-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-sm">
                      {getInitials(employee.firstName, employee.lastName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {employee.firstName} {employee.lastName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {employee.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {employee.positionTitle}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Content Area with proper spacing */}
      <div className="pt-16 flex min-h-screen">
        {/* Sidebar */}
        <aside className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          fixed top-16 left-0 z-30 w-64 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:top-0 lg:h-auto lg:min-h-[calc(100vh-4rem)]
        `}>
          <div className="h-full flex flex-col">
            <nav className="flex-1 p-6 space-y-1 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className={`
                      w-full justify-start h-11 text-left transition-colors
                      ${isActive 
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                      }
                    `}
                    onClick={() => {
                      setActiveSection(item.id);
                      setSidebarOpen(false); // Close sidebar on mobile after selection
                    }}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Button>
                );
              })}
            </nav>
            
            {/* Footer area */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-muted-foreground text-center">
                PayfitLite v1.0
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}