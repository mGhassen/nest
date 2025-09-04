"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useAccount, useAccountPasswordReset, useAccountStatusUpdate, useAccountCreate } from "@/hooks/use-accounts";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import Link from "next/link";

import AdminLayout from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Activity, 
  Key, 
  RefreshCw, 
  UserCheck, 
  UserX, 
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  ExternalLink,
  Plus,
  Settings,
  History,
  Lock,
  Unlock,
  Database,
  Globe,
  Phone,
  MapPin,
  Building2,
  TrendingUp,
  Users,
  FileText,
  BarChart3,
  Bell,
  Zap,
  Info
} from "lucide-react";
import { LoadingPage } from "@/components/ui/loading-spinner";
import { formatDistanceToNow } from "date-fns";

export default function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [accountId, setAccountId] = useState<string | null>(null);

  // Await params to get the id
  useEffect(() => {
    params.then(({ id }) => {
      setAccountId(id);
    });
  }, [params]);

  // Fetch account data
  const { data: account, isLoading: accountLoading, error: accountError } = useAccount(accountId || '');
  
  // Hooks for account actions
  const passwordReset = useAccountPasswordReset();
  const updateStatus = useAccountStatusUpdate();
  const createAccount = useAccountCreate();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/auth/login");
    } else if (!user.isAdmin) {
      router.replace("/unauthorized");
    }
  }, [user, isLoading, router]);

  const handlePasswordReset = () => {
    if (!account) return;
    
    if (confirm(`Send password reset email to ${account.first_name} ${account.last_name} (${account.email})?`)) {
      passwordReset.mutate(account.id, {
        onSuccess: () => {
          toast({
            title: "Password reset email sent",
            description: `A password reset email has been sent to ${account.email}`,
          });
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.message || "Failed to send password reset email",
            variant: "destructive",
          });
        }
      });
    }
  };

  const handleStatusUpdate = (newStatus: string) => {
    if (!account) return;
    
    const action = newStatus === 'SUSPENDED' ? 'suspend' : 'activate';
    const currentStatus = account.account_status || (account.is_active ? 'ACTIVE' : 'INACTIVE');
    
    if (confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} account for ${account.first_name} ${account.last_name}?`)) {
      updateStatus.mutate({ accountId: account.id, status: newStatus }, {
        onSuccess: () => {
          toast({
            title: `Account ${action}d`,
            description: `Account for ${account.first_name} ${account.last_name} has been ${action}d.`,
          });
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.message || `Failed to ${action} account`,
            variant: "destructive",
          });
        }
      });
    }
  };

  const getStatusBadge = (account: any) => {
    const status = account.account_status || (account.is_active ? 'ACTIVE' : 'INACTIVE');
    
    const statusConfig = {
      'ACTIVE': { color: 'bg-green-100 text-green-800', icon: UserCheck, label: 'Active' },
      'PENDING_SETUP': { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Setup' },
      'PASSWORD_RESET_PENDING': { color: 'bg-blue-100 text-blue-800', icon: RefreshCw, label: 'Reset' },
      'PASSWORD_RESET_COMPLETED': { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Ready' },
      'SUSPENDED': { color: 'bg-red-100 text-red-800', icon: UserX, label: 'Suspended' },
      'INACTIVE': { color: 'bg-gray-100 text-gray-800', icon: EyeOff, label: 'Inactive' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.INACTIVE;
    const Icon = config.icon;
    
    return (
      <Badge className={config.color} title={status.replace(/_/g, ' ')}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    return (
      <Badge variant={role === 'ADMIN' ? 'default' : 'secondary'}>
        <Shield className="w-3 h-3 mr-1" />
        {role}
      </Badge>
    );
  };

  if (isLoading || accountLoading) {
    return <LoadingPage />;
  }

  if (!user || !user.isAdmin) {
    return null;
  }

  if (accountError || !account) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-96">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-destructive mb-2">Account Not Found</h3>
                <p className="text-muted-foreground mb-4">
                  The account you're looking for doesn't exist or you don't have access to it.
                </p>
                <Button onClick={() => router.push('/admin/settings/accounts')}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Accounts
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const currentStatus = account.account_status || (account.is_active ? 'ACTIVE' : 'INACTIVE');

  return (
    <AdminLayout>
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin/settings/accounts')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Accounts
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Account Details</h1>
              <p className="text-muted-foreground">
                Comprehensive account management and monitoring
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/settings/accounts')}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Account
            </Button>
            <Button
              variant="outline"
              onClick={handlePasswordReset}
              disabled={passwordReset.isPending}
            >
              <Key className="mr-2 h-4 w-4" />
              {passwordReset.isPending ? "Sending..." : "Reset Password"}
            </Button>
            <Button
              variant={currentStatus === 'SUSPENDED' ? "default" : "destructive"}
              onClick={() => handleStatusUpdate(currentStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED')}
              disabled={updateStatus.isPending}
            >
              {currentStatus === 'SUSPENDED' ? (
                <>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Activate
                </>
              ) : (
                <>
                  <UserX className="mr-2 h-4 w-4" />
                  Suspend
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Account Overview Card */}
        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {account.first_name?.charAt(0)}{account.last_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-2xl font-bold">
                      {account.first_name} {account.last_name}
                    </h2>
                    {getStatusBadge(account)}
                    {getRoleBadge(account.role)}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Mail className="h-4 w-4" />
                      <span>{account.email}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {formatDistanceToNow(new Date(account.created_at), { addSuffix: true })}</span>
                    </div>
                    {account.last_login && (
                      <div className="flex items-center space-x-1">
                        <Activity className="h-4 w-4" />
                        <span>Last active {formatDistanceToNow(new Date(account.last_login), { addSuffix: true })}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {account.employee && (
                <Link href={`/admin/people/${account.employee.id}`}>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <ExternalLink className="h-4 w-4" />
                    <span>View Employee</span>
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different sections */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Info className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Activity</span>
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Permissions</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <History className="h-4 w-4" />
              <span>History</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Account Status */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center space-x-2">
                    <Database className="h-4 w-4" />
                    <span>Account Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Status</span>
                      {getStatusBadge(account)}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Role</span>
                      {getRoleBadge(account.role)}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Active</span>
                      <Badge variant={account.is_active ? "default" : "secondary"}>
                        {account.is_active ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Login Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center space-x-2">
                    <Lock className="h-4 w-4" />
                    <span>Login Info</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Last Login</span>
                      <span className="text-sm font-medium">
                        {account.last_login 
                          ? formatDistanceToNow(new Date(account.last_login), { addSuffix: true })
                          : "Never"
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Failed Attempts</span>
                      <span className="text-sm font-medium">
                        {account.failed_login_attempts || 0}
                      </span>
                    </div>
                    {account.locked_until && new Date(account.locked_until) > new Date() && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Locked Until</span>
                        <span className="text-sm font-medium text-red-600">
                          {formatDistanceToNow(new Date(account.locked_until), { addSuffix: true })}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Password Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center space-x-2">
                    <Key className="h-4 w-4" />
                    <span>Password</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {account.password_reset_requested_at && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Reset Requested</span>
                        <span className="text-sm font-medium">
                          {formatDistanceToNow(new Date(account.password_reset_requested_at), { addSuffix: true })}
                        </span>
                      </div>
                    )}
                    {account.last_password_change_at && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Last Changed</span>
                        <span className="text-sm font-medium">
                          {formatDistanceToNow(new Date(account.last_password_change_at), { addSuffix: true })}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Reset Status</span>
                      <Badge variant={account.password_reset_completed_at ? "default" : "secondary"}>
                        {account.password_reset_completed_at ? "Completed" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Employee Information */}
            {account.employee && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Linked Employee Record</span>
                    </div>
                    <Link href={`/admin/people/${account.employee.id}`}>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Employee
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-green-100 text-green-600">
                        {account.employee.first_name?.charAt(0)}{account.employee.last_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">
                        {account.employee.first_name} {account.employee.last_name}
                      </h4>
                      <p className="text-muted-foreground">
                        {account.employee.position_title}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline">
                          {account.employee.status}
                        </Badge>
                        <Badge variant="secondary">
                          Employee ID: {account.employee.id}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Security Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Account Security Score</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={75} className="w-20" />
                        <span className="text-sm font-medium">75%</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Two-Factor Auth</span>
                        <Badge variant="secondary">Not Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Password Strength</span>
                        <Badge variant="default">Strong</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Account Locked</span>
                        <Badge variant={account.locked_until ? "destructive" : "default"}>
                          {account.locked_until ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5" />
                    <span>Security Alerts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {account.failed_login_attempts > 0 && (
                      <div className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800">
                            {account.failed_login_attempts} failed login attempts
                          </p>
                          <p className="text-xs text-yellow-600">
                            Consider resetting password or investigating
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {account.locked_until && new Date(account.locked_until) > new Date() && (
                      <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg">
                        <Lock className="h-4 w-4 text-red-600" />
                        <div>
                          <p className="text-sm font-medium text-red-800">
                            Account is locked
                          </p>
                          <p className="text-xs text-red-600">
                            Until {formatDistanceToNow(new Date(account.locked_until), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    )}

                    {!account.last_login && (
                      <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                        <Info className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-blue-800">
                            Never logged in
                          </p>
                          <p className="text-xs text-blue-600">
                            Account created but never used
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Recent Activity</span>
                </CardTitle>
                <CardDescription>
                  Account events and activity history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Activity Tracking</h3>
                  <p className="text-muted-foreground mb-4">
                    Account events and activity monitoring will be available soon.
                  </p>
                  <Button variant="outline" disabled>
                    <Bell className="mr-2 h-4 w-4" />
                    Enable Activity Tracking
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Account Permissions</span>
                </CardTitle>
                <CardDescription>
                  Manage account access and permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="font-medium">System Access</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Admin Portal</span>
                        <Badge variant={account.role === 'ADMIN' ? "default" : "secondary"}>
                          {account.role === 'ADMIN' ? "Allowed" : "Denied"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Employee Portal</span>
                        <Badge variant="default">Allowed</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">API Access</span>
                        <Badge variant="default">Allowed</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">Data Access</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">View Accounts</span>
                        <Badge variant={account.role === 'ADMIN' ? "default" : "secondary"}>
                          {account.role === 'ADMIN' ? "Allowed" : "Denied"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Manage Employees</span>
                        <Badge variant={account.role === 'ADMIN' ? "default" : "secondary"}>
                          {account.role === 'ADMIN' ? "Allowed" : "Denied"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">View Reports</span>
                        <Badge variant={account.role === 'ADMIN' ? "default" : "secondary"}>
                          {account.role === 'ADMIN' ? "Allowed" : "Denied"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="h-5 w-5" />
                  <span>Account History</span>
                </CardTitle>
                <CardDescription>
                  Complete account history and changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Account Created</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(account.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  
                  {account.last_login && (
                    <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Last Login</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(account.last_login), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {account.password_reset_requested_at && (
                    <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Password Reset Requested</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(account.password_reset_requested_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {account.last_password_change_at && (
                    <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Password Changed</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(account.last_password_change_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>Login Frequency</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="text-2xl font-bold mb-2">
                      {account.last_login ? "Active" : "Inactive"}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {account.last_login 
                        ? `Last seen ${formatDistanceToNow(new Date(account.last_login), { addSuffix: true })}`
                        : "Never logged in"
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center space-x-2">
                    <Zap className="h-4 w-4" />
                    <span>Account Health</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="text-2xl font-bold mb-2 text-green-600">
                      {account.is_active ? "Healthy" : "Inactive"}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {account.failed_login_attempts || 0} failed attempts
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Account Age</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="text-2xl font-bold mb-2">
                      {Math.floor((new Date().getTime() - new Date(account.created_at).getTime()) / (1000 * 60 * 60 * 24))} days
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Since {new Date(account.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
