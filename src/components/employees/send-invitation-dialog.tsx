"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSendInvitation } from "@/hooks/use-invitations";
import type { Employee } from "@/types/schema";

interface SendInvitationDialogProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function SendInvitationDialog({
  employee,
  open,
  onOpenChange,
  onSuccess,
}: SendInvitationDialogProps) {
  const [role, setRole] = useState<string>("EMPLOYEE");
  const [error, setError] = useState("");
  const { toast } = useToast();
  const sendInvitation = useSendInvitation();

  const handleSendInvitation = async () => {
    if (!employee) return;

    setError("");

    sendInvitation.mutate(
      {
        employeeId: employee.id,
        data: { role: role as "ADMIN" | "EMPLOYEE" },
      },
      {
        onSuccess: () => {
          toast({
            title: "Invitation sent successfully",
            description: `An invitation has been sent to ${employee.email}`,
          });
          onOpenChange(false);
          onSuccess?.();
        },
        onError: (err: any) => {
          console.error("Send invitation error:", err);
          setError(err.message || "Failed to send invitation");
          toast({
            title: "Error",
            description: err.message || "Failed to send invitation",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleClose = () => {
    if (!sendInvitation.isPending) {
      setError("");
      setRole("EMPLOYEE");
      onOpenChange(false);
    }
  };

  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Invitation
          </DialogTitle>
          <DialogDescription>
            Send an invitation to {employee.first_name} {employee.last_name} to create their account.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
              {employee.email}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Account Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EMPLOYEE">Employee</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {role === "ADMIN" 
                ? "Admin users have full access to the system and can manage other users."
                : "Employee users have limited access based on their role and permissions."
              }
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={sendInvitation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSendInvitation}
            disabled={sendInvitation.isPending}
          >
            {sendInvitation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Invitation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
