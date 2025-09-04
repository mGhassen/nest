"use client";

import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { UserProfile } from "@/components/auth/user-profile";
import { useAuth } from "@/hooks/use-auth";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { theme, toggleTheme } = useTheme();
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

  // Check if user is admin or superuser
  if (!user.isAdmin && user.role !== 'SUPERUSER') {
    return null;
  }

  // Superuser without companies should go to onboarding
  if (user.role === 'SUPERUSER' && (!user.companies || user.companies.length === 0)) {
    if (typeof window !== 'undefined' && window.location.pathname !== '/admin/onboarding') {
      window.location.href = '/admin/onboarding';
      return null;
    }
  }

  // Superuser with companies should not be on onboarding
  if (user.role === 'SUPERUSER' && user.companies && user.companies.length > 0) {
    if (typeof window !== 'undefined' && window.location.pathname === '/admin/onboarding') {
      window.location.href = '/admin/dashboard';
      return null;
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="h-4 w-px bg-sidebar-border" />
          </div>
          <div className="flex flex-1 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">Admin Portal</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
                {theme === "light" ? (
                  <Moon className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                ) : (
                  <Sun className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                )}
              </Button>
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
