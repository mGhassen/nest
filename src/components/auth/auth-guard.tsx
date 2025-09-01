"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireAuth?: boolean;
}

export default function AuthGuard({ 
  children, 
  requireAdmin = false, 
  requireAuth = true 
}: AuthGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Still loading, wait

    if (requireAuth && !isAuthenticated) {
      // User not authenticated, redirect to login
      router.push('/auth/login');
      return;
    }

    if (requireAdmin && (!user || !user.isAdmin)) {
      // User not admin, redirect to unauthorized page
      router.push('/unauthorized');
      return;
    }
  }, [user, isLoading, isAuthenticated, requireAdmin, requireAuth, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated, don't render children
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // If admin is required but user is not admin, don't render children
  if (requireAdmin && (!user || !user.isAdmin)) {
    return null;
  }

  // All checks passed, render children
  return <>{children}</>;
}
