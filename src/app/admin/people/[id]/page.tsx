"use client"

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";

import AdminLayout from "@/components/layout/admin-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import EmployeeHeader from "@/components/employees/employee-header"
import EmployeeOverview from "@/components/employees/employee-overview"
import EmployeeAdministration from "@/components/employees/employee-administration"
import EmployeeContracts from "@/components/employees/employee-contracts"
import EmployeePayroll from "@/components/employees/employee-payroll"
import EmployeeDocuments from "@/components/employees/employee-documents"
import type { Employee, PayrollRecord } from "@/types/employee"

export default function EmployeeDetailPage({ params: { id } }: { params: { id: string } }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");


  const [employee, setEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/auth/login");
    } else if (!user.isAdmin) {
      router.replace("/unauthorized");
    }
  }, [user, isLoading, router]);

  // Mock employee data - replace with actual API call
  useEffect(() => {
    // Simulate fetching employee data
    setEmployee({
      id: id,
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@company.com",
      phone: "+1 (555) 123-4567",
      position: "Senior Developer",
      department: "Engineering",
      manager: "Sarah Chen",
      hireDate: "2022-03-15",
      salary: 95000,
      status: "active",
      avatar: null,
      address: "123 Main St, San Francisco, CA 94105",
      emergencyContact: "Jane Smith (Spouse) - +1 (555) 987-6543",
      documents: [
        { id: 1, name: "Employment Contract", type: "contract", uploadDate: "2022-03-15", status: "signed" },
        { id: 2, name: "NDA Agreement", type: "legal", uploadDate: "2022-03-15", status: "signed" },
        { id: 3, name: "Benefits Enrollment", type: "benefits", uploadDate: "2022-03-20", status: "completed" },
        { id: 4, name: "Performance Review Q4 2024", type: "review", uploadDate: "2024-12-01", status: "pending" }
      ],
      contracts: [
        { id: 1, type: "Employment", status: "active", startDate: "2022-03-15", endDate: null, signedDate: "2022-03-15" },
        { id: 2, type: "NDA", status: "active", startDate: "2022-03-15", endDate: null, signedDate: "2022-03-15" }
      ]
    });
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-lg text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (!user || !user.isAdmin) return null;

  if (!employee) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-lg text-muted-foreground">Employee not found</span>
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
    // TODO: Implement password reset functionality
    console.log('Reset password for:', employee?.id);
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
          employee={employee}
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
            <EmployeeOverview employee={employee} />
          </TabsContent>

          {/* Administration Tab */}
          <TabsContent value="administration" className="space-y-4">
            <EmployeeAdministration 
              employeeId={employee.id}
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
              contracts={employee.contracts}
              onCreateContract={handleCreateContract}
              onViewContract={handleViewContract}
              onDownloadContract={handleDownloadContract}
            />
          </TabsContent>

          {/* Payroll Tab */}
          <TabsContent value="payroll" className="space-y-4">
            <EmployeePayroll 
              salary={employee.salary}
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
              documents={employee.documents}
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
