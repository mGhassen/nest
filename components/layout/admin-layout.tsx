import { ReactNode, useState } from "react";
import AdminHeader from "./admin-header";
import Sidebar from "./sidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-background" data-testid="admin-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader onMenuToggle={toggleSidebar} />
        <main className="flex-1 overflow-y-auto" data-testid="admin-main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
