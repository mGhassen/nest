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
    } else if (user.isAdmin) {
      router.replace("/admin/dashboard");
    } else {
      router.replace("/employee/dashboard");
    }
  }, [user, isLoading, router]);

  return <LoadingPage />;
}
