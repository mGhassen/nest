"use client";

import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, Building2, ArrowLeft } from "lucide-react";
import { LoadingPage } from "@/components/ui/loading-spinner";

export default function PortalSelectionPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      redirect("/auth/login");
    }
  }, [user, isLoading]);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!user) {
    return null;
  }

  const isAdmin = user.currentCompany?.is_admin || false;
  const hasEmployeeAccess = user.currentCompany?.hasEmployeeAccess || false;

  // If user has no access, redirect to unauthorized
  if (!isAdmin && !hasEmployeeAccess) {
    redirect("/unauthorized");
  }

  const handlePortalSelection = (portal: 'admin' | 'employee') => {
    if (portal === 'admin') {
      window.location.href = '/admin/dashboard';
    } else {
      window.location.href = '/employee/dashboard';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl">Welcome to {user.currentCompany?.company_name}</CardTitle>
          <CardDescription className="text-lg">
            {isAdmin && hasEmployeeAccess 
              ? "You have access to both admin and employee portals. Please choose which portal you'd like to access."
              : isAdmin 
                ? "You have admin access. Click below to enter the admin portal."
                : "You have employee access. Click below to enter the employee portal."
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className={`grid gap-4 ${isAdmin && hasEmployeeAccess ? 'md:grid-cols-2' : 'md:grid-cols-1 max-w-md mx-auto'}`}>
            {/* Admin Portal Card - only show if user has admin access */}
            {isAdmin && (
              <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-105" onClick={() => handlePortalSelection('admin')}>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">Admin Portal</CardTitle>
                  <CardDescription>
                    Manage employees, view analytics, configure settings, and oversee company operations.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button className="w-full">
                    <Shield className="mr-2 h-4 w-4" />
                    Enter Admin Portal
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Employee Portal Card - only show if user has employee access */}
            {hasEmployeeAccess && (
              <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-105" onClick={() => handlePortalSelection('employee')}>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">Employee Portal</CardTitle>
                  <CardDescription>
                    View your timesheets, submit leave requests, access documents, and manage your profile.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button variant="outline" className="w-full">
                    <Users className="mr-2 h-4 w-4" />
                    Enter Employee Portal
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="text-center space-y-4">
            {isAdmin && hasEmployeeAccess && (
              <p className="text-sm text-muted-foreground">
                You can switch between portals at any time using the portal switcher in the top navigation.
              </p>
            )}
            
            {user.companies && user.companies.length > 1 && (
              <Button 
                variant="outline" 
                onClick={() => router.push('/company-selection')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Switch Company
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
