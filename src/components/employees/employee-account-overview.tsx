"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Key, 
  UserPlus, 
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  UserX,
  Link,
  X,
  MoreVertical,
  Settings,
  LogIn,
  Activity,
  Lock,
  Unlock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAccountsList } from "@/hooks/use-accounts";

interface EmployeeAccountOverviewProps {
  employee: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    account?: {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      role: string;
      is_active: boolean;
      profile_image_url: string | null;
      created_at?: string;
      last_login?: string | null;
      password_reset_requested_at?: string | null;
      password_reset_completed_at?: string | null;
      last_password_change_at?: string | null;
      failed_login_attempts?: number;
      locked_until?: string | null;
    } | null;
  };
  onCreateAccount?: () => void;
  onLinkAccount?: (accountId: string) => void;
  onUnlinkAccount?: () => void;
  onPasswordReset?: () => void;
  onResendInvitation?: () => void;
  onSetPassword?: () => void;
  onToggleAccountStatus?: () => void;
  onViewActivityLog?: () => void;
  onEditAccountDetails?: () => void;
  onChangeRole?: () => void;
  onDeleteAccount?: () => void;
}

export default function EmployeeAccountOverview({ 
  employee, 
  onCreateAccount,
  onLinkAccount,
  onUnlinkAccount,
  onPasswordReset,
  onResendInvitation,
  onSetPassword,
  onToggleAccountStatus,
  onViewActivityLog,
  onEditAccountDetails,
  onChangeRole,
  onDeleteAccount
}: EmployeeAccountOverviewProps) {
  const { toast } = useToast();
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  
  // Get available accounts
  const { data: accounts = [], isLoading: accountsLoading } = useAccountsList();
  
  // Filter accounts that are not already linked to employees
  const availableAccounts = accounts.filter(account => !account.employee);

  // Utility functions
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString?: string | null) => {
    if (!dateString) return 'Never';
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}mo ago`;
  };

  const getSecurityStatus = () => {
    if (!employee.account) return { status: 'none', color: 'text-muted-foreground', icon: AlertCircle };
    
    const { failed_login_attempts, locked_until, last_password_change_at } = employee.account;
    
    if (locked_until && new Date(locked_until) > new Date()) {
      return { status: 'locked', color: 'text-red-600', icon: Lock };
    }
    if (failed_login_attempts && failed_login_attempts >= 3) {
      return { status: 'warning', color: 'text-amber-600', icon: AlertCircle };
    }
    if (last_password_change_at) {
      const daysSinceChange = Math.floor((new Date().getTime() - new Date(last_password_change_at).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceChange > 90) {
        return { status: 'stale', color: 'text-amber-600', icon: Clock };
      }
    }
    return { status: 'secure', color: 'text-green-600', icon: CheckCircle };
  };

  const handleLinkAccount = () => {
    if (selectedAccountId && onLinkAccount) {
      onLinkAccount(selectedAccountId);
      setSelectedAccountId("");
      setShowLinkDialog(false);
    }
  };

  // If employee has no account, show account creation options
  if (!employee.account) {
    return (
      <div className="space-y-6">
        {/* Account Status Card */}
        <Card className="border-dashed border-2 border-muted">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-muted rounded-lg">
                  <UserX className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg">No Account Linked</CardTitle>
                  <CardDescription>
                    {employee.first_name} {employee.last_name} doesn't have a user account yet
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-400">
                <Clock className="h-3 w-3 mr-1" />
                Pending Setup
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This employee needs a user account to access the system. You can create a new account or link to an existing one.
              </AlertDescription>
            </Alert>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={onCreateAccount} className="flex items-center space-x-2 flex-1">
                <UserPlus className="h-4 w-4" />
                <span>Create New Account</span>
              </Button>
              <Button 
                onClick={() => setShowLinkDialog(true)} 
                variant="outline"
                className="flex items-center space-x-2 flex-1"
              >
                <Link className="h-4 w-4" />
                <span>Link Existing Account</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Beautiful Popup with Select List */}
        {showLinkDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-background border border-border rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Link to Existing Account</h2>
                <button 
                  onClick={() => {
                    setShowLinkDialog(false);
                    setSelectedAccountId("");
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-hidden flex flex-col space-y-4">
                <p className="text-sm text-muted-foreground">
                  Select an account to link to <strong className="text-foreground">{employee.first_name} {employee.last_name}</strong>
                </p>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Available Accounts</label>
                  <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose an account..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {accountsLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                          <span className="ml-2 text-sm text-muted-foreground">Loading accounts...</span>
                        </div>
                      ) : availableAccounts.length === 0 ? (
                        <div className="flex items-center justify-center py-4 text-muted-foreground">
                          <User className="h-5 w-5 mr-2" />
                          <span className="text-sm">No available accounts found</span>
                        </div>
                      ) : (
                        availableAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id} className="py-3">
                            <div className="flex items-center justify-between w-full">
                              <div className="flex-1">
                                <div className="font-medium text-foreground">{account.first_name} {account.last_name}</div>
                                <div className="text-sm text-muted-foreground">{account.email}</div>
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                <Badge variant={account.role === 'ADMIN' ? 'default' : 'secondary'} className="text-xs">
                                  {account.role}
                                </Badge>
                                <Badge variant={account.is_active ? 'default' : 'secondary'} className="text-xs">
                                  {account.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-border">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowLinkDialog(false);
                    setSelectedAccountId("");
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleLinkAccount}
                  disabled={!selectedAccountId}
                  className="min-w-[100px]"
                >
                  Link Account
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Account Overview Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Account Overview</CardTitle>
                <CardDescription>
                  User account details for {employee.first_name} {employee.last_name}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={employee.account.is_active ? 'default' : 'secondary'} className="flex items-center space-x-1">
                {employee.account.is_active ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                <span>{employee.account.is_active ? 'Active' : 'Inactive'}</span>
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {/* Password Management */}
                  <DropdownMenuItem onClick={onPasswordReset}>
                    <Key className="h-4 w-4 mr-2" />
                    Reset Password
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onSetPassword}>
                    <Lock className="h-4 w-4 mr-2" />
                    Set New Password
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Account Management */}
                  <DropdownMenuItem onClick={onResendInvitation}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Resend Invitation
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onToggleAccountStatus}>
                    {employee.account.is_active ? (
                      <>
                        <Unlock className="h-4 w-4 mr-2" />
                        Deactivate Account
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Activate Account
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onViewActivityLog}>
                    <Activity className="h-4 w-4 mr-2" />
                    View Activity Log
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Account Actions */}
                  <DropdownMenuItem onClick={onEditAccountDetails}>
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Account Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onChangeRole}>
                    <Shield className="h-4 w-4 mr-2" />
                    Change Role
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Dangerous Actions */}
                  <DropdownMenuItem onClick={onUnlinkAccount} className="text-destructive">
                    <UserX className="h-4 w-4 mr-2" />
                    Unlink Account
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDeleteAccount} className="text-destructive">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Delete Account
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-6">
              {/* Email Information */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Email Address</span>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">{employee.account.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">Login credential</p>
                </div>
              </div>
              
              {/* Role Information */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Account Role</span>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <Badge variant={employee.account.role === 'ADMIN' ? 'default' : 'secondary'} className="text-xs">
                    {employee.account.role === 'ADMIN' ? <Settings className="h-3 w-3 mr-1" /> : <User className="h-3 w-3 mr-1" />}
                    {employee.account.role}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-2">
                    {employee.account.role === 'ADMIN' ? 'Full system access' : 'Standard user access'}
                  </p>
                </div>
              </div>

              {/* Account Creation */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Account Created</span>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">{formatDate(employee.account.created_at)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{getTimeAgo(employee.account.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Right Column - Activity & Security */}
            <div className="space-y-6">
              {/* Last Login */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <LogIn className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Last Login</span>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">{formatDate(employee.account.last_login)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{getTimeAgo(employee.account.last_login)}</p>
                </div>
              </div>

              {/* Security Status */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Security Status</span>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  {(() => {
                    const security = getSecurityStatus();
                    const IconComponent = security.icon;
                    return (
                      <div className="flex items-center space-x-2">
                        <IconComponent className={`h-4 w-4 ${security.color}`} />
                        <span className="text-sm font-medium capitalize">{security.status}</span>
                      </div>
                    );
                  })()}
                  <p className="text-xs text-muted-foreground mt-2">
                    {employee.account.failed_login_attempts ? `${employee.account.failed_login_attempts} failed attempts` : 'No failed attempts'}
                  </p>
                </div>
              </div>

              {/* Password Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Password</span>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">
                    {employee.account.last_password_change_at ? 'Last changed' : 'Never changed'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {employee.account.last_password_change_at ? getTimeAgo(employee.account.last_password_change_at) : 'Default password'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


    </div>
  );
}