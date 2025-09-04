"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { LoadingPage } from "@/components/ui/loading-spinner";

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/auth/login");
    } else {
      const isAdmin = user.currentCompany?.is_admin || false;
      const hasEmployeeAccess = user.currentCompany?.hasEmployeeAccess || false;
      
      if (isAdmin && hasEmployeeAccess) {
        // Both admin and employee access - show portal selection page
        router.replace("/portal-selection");
      } else if (isAdmin && !hasEmployeeAccess) {
        // Admin only - go to admin portal
        router.replace("/admin/dashboard");
      } else if (!isAdmin && hasEmployeeAccess) {
        // Employee only - go to employee portal
        router.replace("/employee/dashboard");
      } else {
        // No access - redirect to unauthorized page
        router.replace("/unauthorized");
      }
    }
  }, [user, isLoading, router]);

  return <LoadingPage />;
}
