"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireSuperuser?: boolean;
  requireCompany?: boolean;
  allowedRoles?: ('SUPERUSER' | 'ADMIN' | 'EMPLOYEE')[];
  redirectTo?: string;
}

export default function RouteGuard({ 
  children, 
  requireAuth = true,
  requireAdmin = false,
  requireSuperuser = false,
  requireCompany = false,
  allowedRoles = [],
  redirectTo
}: RouteGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Still loading, wait

    // Check authentication
    if (requireAuth && !isAuthenticated) {
      router.replace('/auth/login');
      return;
    }

    if (!user) return; // No user data yet

    // Check superuser requirement
    if (requireSuperuser && user.role !== 'SUPERUSER') {
      router.replace(redirectTo || '/unauthorized');
      return;
    }

    // Check admin requirement
    if (requireAdmin && !user.isAdmin) {
      router.replace(redirectTo || '/unauthorized');
      return;
    }

    // Check company requirement
    if (requireCompany) {
      const hasCompanies = user.companies && user.companies.length > 0;
      const hasCurrentCompany = user.currentCompany;
      
      if (!hasCompanies) {
        // Superuser with no companies should go to onboarding
        if (user.role === 'SUPERUSER') {
          router.replace('/admin/onboarding');
          return;
        }
        // Regular users with no companies should go to unauthorized
        router.replace(redirectTo || '/unauthorized');
        return;
      }

      if (!hasCurrentCompany) {
        // User has companies but no current company selected
        router.replace(redirectTo || '/unauthorized');
        return;
      }
    }

    // Check allowed roles
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role as any)) {
      router.replace(redirectTo || '/unauthorized');
      return;
    }

    // Role-based routing logic
    if (user.role === 'SUPERUSER') {
      const hasCompanies = user.companies && user.companies.length > 0;
      if (!hasCompanies) {
        // Superuser with no companies should be on onboarding
        if (window.location.pathname !== '/admin/onboarding') {
          router.replace('/admin/onboarding');
          return;
        }
      } else {
        // Superuser with companies should not be on onboarding
        if (window.location.pathname === '/admin/onboarding') {
          router.replace('/admin/dashboard');
          return;
        }
      }
    } else if (user.role === 'ADMIN') {
      // Admins should not access employee routes
      if (window.location.pathname.startsWith('/employee/')) {
        router.replace('/admin/dashboard');
        return;
      }
    } else if (user.role === 'EMPLOYEE') {
      // Employees should not access admin routes
      if (window.location.pathname.startsWith('/admin/')) {
        router.replace('/employee/dashboard');
        return;
      }
    }

  }, [user, isLoading, isAuthenticated, requireAuth, requireAdmin, requireSuperuser, requireCompany, allowedRoles, redirectTo, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Early return checks to prevent any rendering of prohibited content
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    // Check superuser requirement
    if (requireSuperuser && user.role !== 'SUPERUSER') {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      );
    }

    // Check admin requirement
    if (requireAdmin && !user.isAdmin) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      );
    }

    // Check company requirement
    if (requireCompany) {
      const hasCompanies = user.companies && user.companies.length > 0;
      if (!hasCompanies && user.role !== 'SUPERUSER') {
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        );
      }
    }

    // Check allowed roles
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role as any)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      );
    }

    // Role-based access checks
    if (user.role === 'SUPERUSER') {
      const hasCompanies = user.companies && user.companies.length > 0;
      if (!hasCompanies && window.location.pathname !== '/admin/onboarding') {
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        );
      }
    } else if (user.role === 'ADMIN') {
      if (window.location.pathname.startsWith('/employee/')) {
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        );
      }
    } else if (user.role === 'EMPLOYEE') {
      if (window.location.pathname.startsWith('/admin/')) {
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        );
      }
    }
  }

  // All checks passed, render children
  return <>{children}</>;
}
