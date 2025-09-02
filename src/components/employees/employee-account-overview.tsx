"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  UserX
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
  onPasswordReset?: () => void;
  onResendInvitation?: () => void;
}

export default function EmployeeAccountOverview({ 
  employee, 
  onCreateAccount,
  onPasswordReset,
  onResendInvitation 
}: EmployeeAccountOverviewProps) {
  const { toast } = useToast();

  const getStatusBadge = (account: { is_active: boolean }) => {
    const status = account.is_active ? 'ACTIVE' : 'INACTIVE';
    
    const statusConfig = {
      'ACTIVE': { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Active' },
      'INACTIVE': { color: 'bg-gray-100 text-gray-800', icon: UserX, label: 'Inactive' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.INACTIVE;
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    return (
      <Badge variant={role === 'ADMIN' ? 'default' : 'secondary'}>
        {role}
      </Badge>
    );
  };

  if (!employee.account) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This employee doesn't have a user account yet. Create an account to enable system access.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5" />
              <span>Create Account</span>
            </CardTitle>
            <CardDescription>
              Set up a user account for {employee.first_name} {employee.last_name} to access the system.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="text-sm font-medium">Employee Information</div>
                <div className="text-sm text-muted-foreground">
                  <div>Name: {employee.first_name} {employee.last_name}</div>
                  <div>Email: {employee.email}</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Account Benefits</div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>• Access to employee portal</div>
                  <div>• Timesheet management</div>
                  <div>• Leave request system</div>
                  <div>• Document access</div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={onCreateAccount} className="flex items-center space-x-2">
                <UserPlus className="h-4 w-4" />
                <span>Create Account</span>
              </Button>
            </div>
          </CardContent>
        </Card>
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
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Email</div>
                  <div className="text-sm text-muted-foreground">{employee.account.email}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Role</div>
                  <div className="mt-1">{getRoleBadge(employee.account.role)}</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Status</div>
                  <div className="mt-1">{getStatusBadge(employee.account)}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Account ID</div>
                  <div className="text-sm text-muted-foreground">
                    {employee.account.id}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>Account Management</span>
          </CardTitle>
          <CardDescription>
            Manage account access and permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-sm font-medium">Account Actions</div>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onPasswordReset}
                  className="w-full justify-start"
                >
                  <Key className="mr-2 h-4 w-4" />
                  Reset Password
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onResendInvitation}
                  className="w-full justify-start"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Resend Invitation
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium">Account Details</div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Account ID: {employee.account.id}</div>
                <div>Profile Image: {employee.account.profile_image_url ? 'Set' : 'Not set'}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
