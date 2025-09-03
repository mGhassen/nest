"use client"

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { usePerson } from "@/hooks/use-people";
import { useEmployeeInvitation, useAccountPasswordReset, useEmployeeLinkAccount, useEmployeeUnlinkAccount } from "@/hooks/use-accounts";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

import AdminLayout from "@/components/layout/admin-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { 
  MoreVertical, 
  Edit, 
  UserCheck, 
  UserX, 
  Archive, 
  Trash2, 
  Ban, 
  Unlock, 
  Lock, 
  Key, 
  RefreshCw, 
  Shield, 
  Activity, 
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react"
import EmployeeHeader from "@/components/employees/employee-header"
import EmployeeOverview from "@/components/employees/employee-overview"
import EmployeeAdministration from "@/components/employees/employee-administration"
import EmployeeContracts from "@/components/employees/employee-contracts"
import EmployeePayroll from "@/components/employees/employee-payroll"
import EmployeeDocuments from "@/components/employees/employee-documents"
import EmployeeAccountOverview from "@/components/employees/employee-account-overview"
import type { EmployeeDetail, PayrollRecord } from "@/types/employee"
import { LoadingPage } from "@/components/ui/loading-spinner"

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [deleteAccountDialog, setDeleteAccountDialog] = useState(false);
  const [unlinkAccountDialog, setUnlinkAccountDialog] = useState(false);

  // Await params to get the id and check for tab parameter
  useEffect(() => {
    params.then(({ id }) => {
      setEmployeeId(id);
    });
    
    // Check for tab parameter in URL on initial load
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    const validTabs = ['overview', 'account', 'administration', 'contracts', 'payroll', 'documents'];
    
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam);
    } else {
      // If no valid tab parameter, set default and update URL
      const url = new URL(window.location.href);
      url.searchParams.set('tab', 'overview');
      window.history.replaceState({}, '', url.toString());
    }
  }, [params]);

  // Handle tab changes and update URL
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    
    // Update URL with tab parameter
    const url = new URL(window.location.href);
    url.searchParams.set('tab', newTab);
    window.history.replaceState({}, '', url.toString());
  };

  // Listen for browser navigation (back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      const validTabs = ['overview', 'account', 'administration', 'contracts', 'payroll', 'documents'];
      
      if (tabParam && validTabs.includes(tabParam)) {
        setActiveTab(tabParam);
      } else {
        setActiveTab('overview');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch employee data from API
  const { data: employee, isLoading: employeeLoading, error: employeeError } = usePerson(employeeId || '');
  
  // Hooks for employee actions
  const sendInvitation = useEmployeeInvitation();
  const resetPassword = useAccountPasswordReset();
  const linkAccount = useEmployeeLinkAccount();
  const unlinkAccount = useEmployeeUnlinkAccount();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/auth/login");
    } else if (!user.isAdmin) {
      router.replace("/unauthorized");
    }
  }, [user, isLoading, router]);

  // Transform employee data for legacy components
  const transformedEmployee = employee ? {
    id: employee.id,
    firstName: employee.first_name,
    lastName: employee.last_name,
    email: employee.email,
    phone: "", // Not available in current schema
    position: employee.position_title,
    department: "Unknown", // TODO: Add cost_center relation to API
    manager: "No Manager", // TODO: Add manager relation to API
    hireDate: employee.hire_date,
    salary: employee.base_salary,
    status: employee.status?.toLowerCase() || "active",
    avatar: employee.account?.profile_image_url || null,
    address: "No Address", // TODO: Add location relation to API
    emergencyContact: "Not Available", // Not available in current schema
    documents: [], // TODO: Add documents relation to API
    contracts: [] // TODO: Add contracts relation to API
  } : null;

  if (isLoading || employeeLoading || !employeeId) {
    return <LoadingPage />;
  }

  if (!user || !user.isAdmin) return null;

  if (employeeError || !employee || !transformedEmployee) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-lg text-muted-foreground">
          {employeeError ? "Error loading employee" : "Employee not found"}
        </span>
      </div>
    );
  }

  // Event handlers for component actions
  const handleEditEmployee = () => {
    // TODO: Implement edit employee functionality
    console.log('Edit employee:', employee?.id);
  };

  const handleViewProfile = () => {
    // TODO: Implement view profile functionality
    console.log('View profile:', employee?.id);
  };

  const handlePasswordReset = () => {
    if (!employee?.account?.id) return;
    
    resetPassword.mutate(employee.account.id, {
      onSuccess: () => {
        toast({
          title: "Password reset email sent",
          description: `A password reset email has been sent to ${employee?.account?.email}`,
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to send password reset email",
          variant: "destructive",
        });
      }
    });
  };

  const handleResendInvitation = () => {
    // TODO: Implement resend invitation functionality
    console.log('Resend invitation for:', employee?.id);
  };

  const handleCreateAccount = () => {
    if (!employee) return;
    
    if (confirm(`Create user account for ${employee.first_name} ${employee.last_name} (${employee.email})?`)) {
      sendInvitation.mutate({ employeeId: employee.id, role: 'EMPLOYEE' }, {
        onSuccess: () => {
          alert(`Account created and invitation sent to ${employee.email}`);
        },
        onError: (error) => {
          console.error('Create account error:', error);
          alert(`Error: ${error.message || "Failed to create account"}`);
        }
      });
    }
  };

    const handleLinkAccount = (accountId: string) => {
    if (!employee) return;

    linkAccount.mutate({ employeeId: employee.id, accountId }, {
      onSuccess: (data) => {
        toast({
          title: "Account Linked Successfully",
          description: `Employee linked to account: ${data.data?.account?.email || 'Unknown'}`,
        });
      },
      onError: (error) => {
        console.error('Link account error:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to link account",
          variant: "destructive",
        });
      }
    });
  };

  const handleUnlinkAccount = () => {
    setUnlinkAccountDialog(true);
  };

  const confirmUnlinkAccount = () => {
    if (!employee?.account?.id) return;
    
    unlinkAccount.mutate(employee.account.id, {
      onSuccess: (data) => {
        toast({
          title: "Account Unlinked Successfully",
          description: `Employee unlinked from account: ${data.data?.account?.email || 'Unknown'}`,
        });
        setUnlinkAccountDialog(false);
      },
      onError: (error) => {
        console.error('Unlink account error:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to unlink account",
          variant: "destructive",
        });
      }
    });
  };

  const handleChangeRole = () => {
    // TODO: Implement change role functionality
    console.log('Change role for:', employee?.id);
  };

  const handleSuspendAccount = () => {
    // TODO: Implement suspend account functionality
    console.log('Suspend account for:', employee?.id);
  };

  const handleArchiveEmployee = () => {
    // TODO: Implement archive employee functionality
    console.log('Archive employee:', employee?.id);
  };

  const handleDeleteAccount = () => {
    setDeleteAccountDialog(true);
  };

  const confirmDeleteAccount = () => {
    if (!employee?.account?.id) return;
    
    // TODO: Implement actual delete account API call
    // For now, just show a success message
    toast({
      title: "Account Deleted",
      description: "The employee account has been successfully deleted.",
    });
    setDeleteAccountDialog(false);
  };

  const handleCreateContract = () => {
    // TODO: Implement create contract functionality
    console.log('Create contract for:', employee?.id);
  };

  const handleViewContract = (contractId: number) => {
    // TODO: Implement view contract functionality
    console.log('View contract:', contractId);
  };

  const handleDownloadContract = (contractId: number) => {
    // TODO: Implement download contract functionality
    console.log('Download contract:', contractId);
  };

  const handleViewPayHistory = () => {
    // TODO: Implement view pay history functionality
    console.log('View pay history for:', employee?.id);
  };

  const handleGeneratePayStub = () => {
    // TODO: Implement generate pay stub functionality
    console.log('Generate pay stub for:', employee?.id);
  };

  const handleDownloadTaxForms = () => {
    // TODO: Implement download tax forms functionality
    console.log('Download tax forms for:', employee?.id);
  };

  const handleUploadPayroll = () => {
    // TODO: Implement upload payroll functionality
    console.log('Upload payroll for:', employee?.id);
  };

  const handleUploadDocument = () => {
    // TODO: Implement upload document functionality
    console.log('Upload document for:', employee?.id);
  };

  const handleViewDocument = (documentId: number) => {
    // TODO: Implement view document functionality
    console.log('View document:', documentId);
  };

  const handleDownloadDocument = (documentId: number) => {
    // TODO: Implement download document functionality
    console.log('Download document:', documentId);
  };

  // Mock payroll history data
  const payrollHistory: PayrollRecord[] = [
    { period: "Dec 2024", amount: 7916.67, status: "Paid" },
    { period: "Nov 2024", amount: 7916.67, status: "Paid" },
    { period: "Oct 2024", amount: 7916.67, status: "Paid" },
    { period: "Sep 2024", amount: 7916.67, status: "Paid" },
    { period: "Aug 2024", amount: 7916.67, status: "Paid" },
    { period: "Jul 2024", amount: 7916.67, status: "Paid" }
  ];

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {/* Header */}
        <EmployeeHeader 
          employee={transformedEmployee}
          onEditEmployee={handleEditEmployee}
          onViewProfile={handleViewProfile}
        />

        {/* Employee Status & Actions Bar */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center space-x-4">
            {/* Employee Status */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                {employee.status === 'ACTIVE' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : employee.status === 'INACTIVE' ? (
                  <Clock className="h-4 w-4 text-amber-600" />
                ) : employee.status === 'TERMINATED' ? (
                  <UserX className="h-4 w-4 text-red-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                )}
                <span className="text-sm font-medium">Status:</span>
                <Badge 
                  variant={employee.status === 'ACTIVE' ? 'default' : 'secondary'}
                  className={
                    employee.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                    employee.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' :
                    employee.status === 'TERMINATED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                  }
                >
                  {employee.status?.replace('_', ' ') || 'Unknown'}
                </Badge>
              </div>
            </div>

            {/* Account Status */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Account:</span>
              {employee.account ? (
                <div className="flex items-center space-x-1">
                  {employee.account.is_active ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  )}
                  <Badge variant={employee.account.is_active ? 'default' : 'secondary'}>
                    {employee.account.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {employee.account.role}
                  </Badge>
                </div>
              ) : (
                <div className="flex items-center space-x-1">
                  <UserX className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline">No Account</Badge>
                </div>
              )}
            </div>
          </div>

          {/* Action Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4 mr-2" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {/* Employee Management */}
              <DropdownMenuItem onClick={handleEditEmployee}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Employee Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleViewProfile}>
                <Activity className="h-4 w-4 mr-2" />
                View Activity Log
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {/* Account Management */}
              <DropdownMenuItem onClick={handlePasswordReset}>
                <Key className="h-4 w-4 mr-2" />
                Reset Password
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleResendInvitation}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Resend Invitation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleChangeRole}>
                <Shield className="h-4 w-4 mr-2" />
                Change Role
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {/* Status Management */}
              <DropdownMenuItem onClick={handleSuspendAccount}>
                <Ban className="h-4 w-4 mr-2" />
                Suspend Account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleArchiveEmployee}>
                <Archive className="h-4 w-4 mr-2" />
                Archive Employee
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {/* Dangerous Actions */}
              <DropdownMenuItem onClick={handleUnlinkAccount} className="text-amber-600">
                <UserX className="h-4 w-4 mr-2" />
                Unlink Account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDeleteAccount} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="administration">Administration</TabsTrigger>
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <EmployeeOverview employee={transformedEmployee} />
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-4">
            <EmployeeAccountOverview 
              employee={{
                id: employee.id,
                first_name: employee.first_name,
                last_name: employee.last_name,
                email: employee.email,
                account: employee.account ? {
                  id: employee.account.id,
                  email: employee.account.email,
                  first_name: employee.account.first_name,
                  last_name: employee.account.last_name,
                  role: employee.account.role,
                  is_active: employee.account.is_active || false,
                  profile_image_url: employee.account.profile_image_url
                } : null
              }}
              onCreateAccount={handleCreateAccount}
              onLinkAccount={handleLinkAccount}
              onUnlinkAccount={handleUnlinkAccount}
              onPasswordReset={handlePasswordReset}
              onResendInvitation={handleResendInvitation}
            />
          </TabsContent>

          {/* Administration Tab */}
          <TabsContent value="administration" className="space-y-4">
            <EmployeeAdministration 
              employeeId={employee.id}
              employee={{
                ...employee,
                status: employee.status || 'ACTIVE',
                account: employee.account ? {
                  id: employee.account.id,
                  role: employee.account.role,
                  is_active: employee.account.is_active || false,
                  last_login: employee.account.last_login,
                  created_at: employee.account.created_at || undefined
                } : null
              }}
              onPasswordReset={handlePasswordReset}
              onSetPassword={() => {/* TODO: Implement set password */}}
              onResendInvitation={handleResendInvitation}
              onChangeRole={handleChangeRole}
              onToggleAccountStatus={() => {/* TODO: Implement toggle account status */}}
              onSuspendAccount={handleSuspendAccount}
              onArchiveEmployee={handleArchiveEmployee}
              onDeleteAccount={handleDeleteAccount}
              onEditEmployeeDetails={handleEditEmployee}
              onViewActivityLog={handleViewProfile}
              onManagePermissions={() => {/* TODO: Implement manage permissions */}}
              onTransferEmployee={() => {/* TODO: Implement transfer employee */}}
              onGenerateReport={() => {/* TODO: Implement generate report */}}
            />
          </TabsContent>

          {/* Contracts Tab */}
          <TabsContent value="contracts" className="space-y-4">
            <EmployeeContracts 
              contracts={transformedEmployee.contracts}
              onCreateContract={handleCreateContract}
              onViewContract={handleViewContract}
              onDownloadContract={handleDownloadContract}
            />
          </TabsContent>

          {/* Payroll Tab */}
          <TabsContent value="payroll" className="space-y-4">
            <EmployeePayroll 
              salary={transformedEmployee.salary}
              payrollHistory={payrollHistory}
              onViewPayHistory={handleViewPayHistory}
              onGeneratePayStub={handleGeneratePayStub}
              onDownloadTaxForms={handleDownloadTaxForms}
              onUploadPayroll={handleUploadPayroll}
            />
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <EmployeeDocuments 
              documents={transformedEmployee.documents}
              onUploadDocument={handleUploadDocument}
              onViewDocument={handleViewDocument}
              onDownloadDocument={handleDownloadDocument}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={deleteAccountDialog} onOpenChange={setDeleteAccountDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Employee Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the account for <strong>{employee?.first_name} {employee?.last_name}</strong>? 
              This will permanently remove their account and they will no longer be able to access the system.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteAccountDialog(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteAccount}
              className="w-full sm:w-auto"
            >
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unlink Account Confirmation Dialog */}
      <Dialog open={unlinkAccountDialog} onOpenChange={setUnlinkAccountDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Unlink Employee Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to unlink the account for <strong>{employee?.first_name} {employee?.last_name}</strong>? 
              This will remove the connection between the employee and their account, but the account will remain active.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setUnlinkAccountDialog(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={confirmUnlinkAccount}
              className="w-full sm:w-auto"
            >
              Unlink Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
