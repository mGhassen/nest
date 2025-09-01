import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Users } from "lucide-react";

interface EmployeeAdministrationProps {
  employeeId: string;
  onPasswordReset?: () => void;
  onResendInvitation?: () => void;
  onChangeRole?: () => void;
  onSuspendAccount?: () => void;
  onArchiveEmployee?: () => void;
  onDeleteAccount?: () => void;
}

export default function EmployeeAdministration({ 
  employeeId,
  onPasswordReset,
  onResendInvitation,
  onChangeRole,
  onSuspendAccount,
  onArchiveEmployee,
  onDeleteAccount
}: EmployeeAdministrationProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account Management</CardTitle>
            <CardDescription>Manage employee account settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={onPasswordReset}
              >
                <User className="mr-2 h-4 w-4" />
                Reset Password
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={onResendInvitation}
              >
                <Mail className="mr-2 h-4 w-4" />
                Resend Invitation
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={onChangeRole}
              >
                <Users className="mr-2 h-4 w-4" />
                Change Role
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Management</CardTitle>
            <CardDescription>Manage employee status and permissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={onSuspendAccount}
              >
                <User className="mr-2 h-4 w-4" />
                Suspend Account
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={onArchiveEmployee}
              >
                <Users className="mr-2 h-4 w-4" />
                Archive Employee
              </Button>
              <Button 
                variant="destructive" 
                className="w-full justify-start"
                onClick={onDeleteAccount}
              >
                <User className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
