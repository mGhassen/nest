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
  Plus
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
                Manage account settings and permissions
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

        {/* Account Information */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-lg">
                    {account.first_name?.charAt(0)}{account.last_name?.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {account.first_name} {account.last_name}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    {getRoleBadge(account.role)}
                    {getStatusBadge(account)}
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <span className="text-sm font-medium">{account.email}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Created:</span>
                  <span className="text-sm font-medium">
                    {formatDistanceToNow(new Date(account.created_at), { addSuffix: true })}
                  </span>
                </div>
                
                {account.last_login && (
                  <div className="flex items-center space-x-3">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Last Login:</span>
                    <span className="text-sm font-medium">
                      {formatDistanceToNow(new Date(account.last_login), { addSuffix: true })}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Status & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Account Status & Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-muted-foreground">Account Status:</span>
                  <div className="mt-1">
                    {getStatusBadge(account)}
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-muted-foreground">Role:</span>
                  <div className="mt-1">
                    {getRoleBadge(account.role)}
                  </div>
                </div>
                
                {account.failed_login_attempts && account.failed_login_attempts > 0 && (
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-yellow-700">
                      {account.failed_login_attempts} failed login attempts
                    </span>
                  </div>
                )}
                
                {account.locked_until && new Date(account.locked_until) > new Date() && (
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-700">
                      Account locked until {formatDistanceToNow(new Date(account.locked_until), { addSuffix: true })}
                    </span>
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                {account.password_reset_requested_at && (
                  <div>
                    <span className="text-sm text-muted-foreground">Password Reset:</span>
                    <div className="mt-1 space-y-1">
                      <div className="text-sm">
                        Requested: {formatDistanceToNow(new Date(account.password_reset_requested_at), { addSuffix: true })}
                      </div>
                      {account.password_reset_completed_at && (
                        <div className="text-sm text-green-600">
                          Completed: {formatDistanceToNow(new Date(account.password_reset_completed_at), { addSuffix: true })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {account.last_password_change_at && (
                  <div>
                    <span className="text-sm text-muted-foreground">Last Password Change:</span>
                    <div className="mt-1 text-sm">
                      {formatDistanceToNow(new Date(account.last_password_change_at), { addSuffix: true })}
                    </div>
                  </div>
                )}
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
                  <User className="h-5 w-5" />
                  <span>Linked Employee</span>
                </div>
                <Link href={`/admin/people/${account.employee.id}`}>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Employee
                  </Button>
                </Link>
              </CardTitle>
              <CardDescription>
                This account is linked to an employee record
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-medium text-sm">
                    {account.employee.first_name?.charAt(0)}{account.employee.last_name?.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium">
                    {account.employee.first_name} {account.employee.last_name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {account.employee.position_title}
                  </p>
                  <Badge variant="outline" className="mt-1">
                    {account.employee.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Account Events (if available) */}
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
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Account events viewer will be available soon.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
