"use client";

import * as React from "react";
import { ChevronsUpDown, Plus, 
  Building2, Users, Lightbulb, Briefcase, 
  Heart, Star, Zap, Shield, Globe, 
  Target, Rocket, Coffee, Home, 
  Car, Plane, Ship, Truck } from "lucide-react";
import { usePathname } from "next/navigation";
import { useUserCompanies, useCurrentCompany, useSwitchCompany } from "@/hooks/use-companies";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

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

export function CompanySwitcher() {
  const { user } = useAuth();
  const { data: companies = [], isLoading: companiesLoading } = useUserCompanies();
  const { data: currentCompany, isLoading: currentLoading } = useCurrentCompany();
  const switchCompany = useSwitchCompany();
  const { isMobile } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();
  
  // Check if current user is a superuser
  const isSuperuser = user?.role === 'SUPERUSER';
  
  // Determine current portal
  const currentPortal = pathname.startsWith('/admin') ? 'admin' : 'employee';
  
  // Force re-render when user changes
  console.log('CompanySwitcher render - user role:', user?.role, 'isSuperuser:', isSuperuser);
  
  // Debug logging
  console.log('CompanySwitcher Debug:', {
    user: !!user,
    userRole: user?.role,
    companies: companies.length,
    currentCompany,
    isSuperuser,
    companiesLoading,
    currentLoading
  });

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  const handleSelect = (companyId: string) => {
    if (companyId === currentCompany?.company_id) {
      return;
    }

    switchCompany.mutate(companyId, {
      onSuccess: (newCompany) => {
        // Determine which portal to redirect to based on permissions
        const isAdmin = newCompany.is_admin || false;
        const hasEmployeeAccess = newCompany.hasEmployeeAccess || false;
        
        console.log('Company switch - permissions:', { isAdmin, hasEmployeeAccess, companyId });
        
        if (isAdmin && hasEmployeeAccess) {
          // Both admin and employee access - go to admin portal (can switch)
          window.location.href = '/admin/dashboard';
        } else if (isAdmin && !hasEmployeeAccess) {
          // Admin only - go to admin portal
          window.location.href = '/admin/dashboard';
        } else if (!isAdmin && hasEmployeeAccess) {
          // Employee only - go to employee portal
          window.location.href = '/employee/dashboard';
        } else {
          // No access - redirect to unauthorized page
          window.location.href = '/unauthorized';
        }
      },
      onError: (error) => {
        console.error('Failed to switch company:', error);
      },
    });
  };

  if (companiesLoading || currentLoading || !currentCompany) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <div className="size-4 rounded-sm bg-current" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Loading...</span>
              <span className="truncate text-xs">Please wait</span>
            </div>
            <ChevronsUpDown className="ml-auto" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!companies || companies.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <div className="size-4 rounded-sm bg-current" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">No companies</span>
              <span className="truncate text-xs">Contact admin</span>
            </div>
            <ChevronsUpDown className="ml-auto" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                {(() => {
                  const IconComponent = getCompanyIcon(currentCompany.icon_name);
                  return <IconComponent className="size-4" />;
                })()}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{currentCompany.company_name}</span>
                <div className="flex items-center gap-1">
                  {currentPortal === 'admin' ? (
                    <Shield className="size-3 text-blue-500" />
                  ) : (
                    <Users className="size-3 text-green-500" />
                  )}
                  <span className="truncate text-xs text-muted-foreground">
                    {isSuperuser ? 'Superuser' : 
                     currentPortal === 'admin' ? 'Admin Portal' : 'Employee Portal'}
                  </span>
                </div>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Companies
            </DropdownMenuLabel>
            {companies.map((company, index) => {
              const IconComponent = getCompanyIcon(company.icon_name);
              return (
                <DropdownMenuItem
                  key={company.company_id}
                  onClick={() => handleSelect(company.company_id)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <IconComponent className="size-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{company.company_name}</span>
                    <div className="flex items-center gap-1">
                      {company.is_admin ? (
                        <Shield className="size-3 text-blue-500" />
                      ) : (
                        <Users className="size-3 text-green-500" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {isSuperuser ? 'Superuser' : 
                         company.is_admin ? 'Admin Access' : 'Employee Access'}
                      </span>
                    </div>
                  </div>
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              );
            })}
            {isSuperuser && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="gap-2 p-2" 
                  onClick={() => router.push('/admin/companies/create')}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                    <Plus className="size-4" />
                  </div>
                  <div className="text-muted-foreground font-medium">Create Company</div>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}