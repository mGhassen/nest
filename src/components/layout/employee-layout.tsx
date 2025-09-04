"use client";

import { useAuth } from "@/hooks/use-auth";
import { EmployeeSidebar } from "@/components/employee-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

interface EmployeeLayoutProps {
  children: React.ReactNode;
}

export default function EmployeeLayout({ children }: EmployeeLayoutProps) {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  // Check if user has companies
  if (!user.companies || user.companies.length === 0) {
    return null;
  }

  return (
    <SidebarProvider>
      <EmployeeSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
