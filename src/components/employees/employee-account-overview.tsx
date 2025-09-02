"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  X
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
    } | null;
  };
  onCreateAccount?: () => void;
  onLinkAccount?: (accountId: string) => void;
  onUnlinkAccount?: () => void;
  onPasswordReset?: () => void;
  onResendInvitation?: () => void;
}

export default function EmployeeAccountOverview({ 
  employee, 
  onCreateAccount,
  onLinkAccount,
  onUnlinkAccount,
  onPasswordReset,
  onResendInvitation 
}: EmployeeAccountOverviewProps) {
  const { toast } = useToast();
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  
  // Get available accounts
  const { data: accounts = [], isLoading: accountsLoading } = useAccountsList();
  
  // Filter accounts that are not already linked to employees
  const availableAccounts = accounts.filter(account => !account.employee);

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
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Account Information</span>
            </CardTitle>
            <CardDescription>
              No user account found for {employee.first_name} {employee.last_name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This employee doesn't have a user account yet. You can create a new account or link to an existing one.
              </AlertDescription>
            </Alert>
            
            <div className="flex space-x-2">
              <Button onClick={onCreateAccount} className="flex items-center space-x-2">
                <UserPlus className="h-4 w-4" />
                <span>Create Account</span>
              </Button>
              <Button 
                onClick={() => setShowLinkDialog(true)} 
                className="flex items-center space-x-2"
              >
                <Link className="h-4 w-4" />
                <span>Link to Existing Account</span>
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
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Account Information</span>
          </CardTitle>
          <CardDescription>
            User account details for {employee.first_name} {employee.last_name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Email</span>
              </div>
              <p className="text-sm text-muted-foreground">{employee.account.email}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Role</span>
              </div>
              <Badge variant={employee.account.role === 'ADMIN' ? 'default' : 'secondary'}>
                {employee.account.role}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Status</span>
              </div>
              <Badge variant={employee.account.is_active ? 'default' : 'secondary'}>
                {employee.account.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
          
          <div className="flex space-x-2 pt-4">
            <Button onClick={onPasswordReset} variant="outline" size="sm">
              <Key className="h-4 w-4 mr-2" />
              Reset Password
            </Button>
            <Button onClick={onResendInvitation} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Resend Invitation
            </Button>
            <Button onClick={onUnlinkAccount} variant="destructive" size="sm">
              <UserX className="h-4 w-4 mr-2" />
              Unlink Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}