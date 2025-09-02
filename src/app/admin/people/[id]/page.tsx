"use client"

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { usePerson } from "@/hooks/use-people";
import { useEffect, useState } from "react";

import AdminLayout from "@/components/layout/admin-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import EmployeeHeader from "@/components/employees/employee-header"
import EmployeeOverview from "@/components/employees/employee-overview"
import EmployeeAdministration from "@/components/employees/employee-administration"
import EmployeeContracts from "@/components/employees/employee-contracts"
import EmployeePayroll from "@/components/employees/employee-payroll"
import EmployeeDocuments from "@/components/employees/employee-documents"
import type { EmployeeDetail, PayrollRecord } from "@/types/employee"

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [employeeId, setEmployeeId] = useState<string | null>(null);

  // Await params to get the id
  useEffect(() => {
    params.then(({ id }) => {
      setEmployeeId(id);
    });
  }, [params]);

  // Fetch employee data from API
  const { data: employee, isLoading: employeeLoading, error: employeeError } = usePerson(employeeId || '');

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
    department: employee.cost_center?.name || "Unknown",
    manager: employee.manager ? `${employee.manager.first_name} ${employee.manager.last_name}` : "No Manager",
    hireDate: employee.hire_date,
    salary: employee.base_salary,
    status: employee.status?.toLowerCase() || "active",
    avatar: employee.account?.profile_image_url || null,
    address: employee.location ? `${employee.location.address || ''} ${employee.location.city || ''} ${employee.location.state || ''} ${employee.location.country || ''}`.trim() : "No Address",
    emergencyContact: "Not Available", // Not available in current schema
    documents: employee.documents || [],
    contracts: employee.contracts || []
  } : null;

  if (isLoading || employeeLoading || !employeeId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-lg text-muted-foreground">Loading...</span>
      </div>
    );
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
    if (!employee) return;
    
    if (confirm(`Send password reset email to ${employee.first_name} ${employee.last_name} (${employee.email})?`)) {
      // Call the password reset API
      fetch(`/api/people/${employee.id}/password/reset`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // You might want to add a toast notification here
          alert(`Password reset email sent to ${employee.email}`);
        } else {
          throw new Error(data.error || 'Failed to send password reset email');
        }
      })
      .catch(error => {
        console.error('Password reset error:', error);
        alert(`Error: ${error.message || "Failed to send password reset email"}`);
      });
    }
  };

  const handleResendInvitation = () => {
    // TODO: Implement resend invitation functionality
    console.log('Resend invitation for:', employee?.id);
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
    // TODO: Implement delete account functionality
    console.log('Delete account for:', employee?.id);
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

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="administration">Administration</TabsTrigger>
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <EmployeeOverview employee={transformedEmployee} />
          </TabsContent>

          {/* Administration Tab */}
          <TabsContent value="administration" className="space-y-4">
            <EmployeeAdministration 
              employeeId={transformedEmployee.id}
              onPasswordReset={handlePasswordReset}
              onResendInvitation={handleResendInvitation}
              onChangeRole={handleChangeRole}
              onSuspendAccount={handleSuspendAccount}
              onArchiveEmployee={handleArchiveEmployee}
              onDeleteAccount={handleDeleteAccount}
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
    </AdminLayout>
  );
}
