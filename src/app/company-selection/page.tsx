"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Users, Lightbulb, Briefcase, 
  Heart, Star, Zap, Shield, Globe, 
  Target, Rocket, Coffee, Home, 
  Car, Plane, Ship, Truck } from "lucide-react";
import { LoadingPage } from "@/components/ui/loading-spinner";
import { redirect } from "next/navigation";

// Icon mapping for company icons
const iconMap = {
  Building2, Users, Lightbulb, Briefcase, 
  Heart, Star, Zap, Shield, Globe, 
  Target, Rocket, Coffee, Home, 
  Car, Plane, Ship, Truck
};

const getCompanyIcon = (iconName?: string) => {
  if (!iconName || !(iconName in iconMap)) {
    return Building2; // Default icon
  }
  return iconMap[iconName as keyof typeof iconMap];
};

export default function CompanySelectionPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      redirect("/auth/login");
    }
  }, [user, isLoading]);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!user) {
    return null;
  }

  // If user has only one company, skip company selection and go to portal selection
  if (user.companies && user.companies.length === 1) {
    const company = user.companies[0];
    const isAdmin = company.is_admin || false;
    if (isAdmin) {
      // Admin access - go to admin portal
      redirect("/admin/dashboard");
    } else {
      // Employee access - go to employee portal
      redirect("/employee/dashboard");
    }
  }

  // If user has no companies, redirect to onboarding (for superusers) or unauthorized
  if (!user.companies || user.companies.length === 0) {
    if (user.role === 'SUPERUSER') {
      redirect("/admin/onboarding");
    } else {
      redirect("/unauthorized");
    }
  }

  const handleCompanySelect = (companyId: string) => {
    // Switch to the selected company and then go to portal selection
    fetch('/api/user/current-company', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({ company_id: companyId })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // After switching company, go to portal selection
        window.location.href = '/portal-selection';
      } else {
        console.error('Failed to switch company:', data.error);
      }
    })
    .catch(error => {
      console.error('Error switching company:', error);
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl">Select Your Company</CardTitle>
          <CardDescription className="text-lg">
            Choose which company you'd like to access. You can switch between companies at any time.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {user.companies?.map((company) => {
              const IconComponent = getCompanyIcon('Building2');
              const isCurrentCompany = company.company_id === user.currentCompany?.company_id;
              
              return (
                <Card 
                  key={company.company_id}
                  className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                    isCurrentCompany ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => handleCompanySelect(company.company_id)}
                >
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{company.company_name}</CardTitle>
                    <CardDescription>
                      {company.is_admin ? 'Admin Access' : 'Employee Access'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button 
                      variant={isCurrentCompany ? "default" : "outline"} 
                      className="w-full"
                    >
                      {isCurrentCompany ? 'Current Company' : 'Select Company'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {user.role === 'SUPERUSER' && (
            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={() => router.push('/admin/settings/companies/create')}
                className="gap-2"
              >
                <Building2 className="h-4 w-4" />
                Create New Company
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
