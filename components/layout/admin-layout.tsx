import { ReactNode } from "react";
import AdminHeader from "./admin-header";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-background" data-testid="admin-layout">
      <AdminHeader />
      <main className="flex-1 overflow-y-auto" data-testid="admin-main-content">
        {children}
      </main>
    </div>
  );
}
