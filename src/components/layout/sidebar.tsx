import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Clock, 
  Calendar, 
  DollarSign, 
  FileText, 
  Settings,
  BarChart3,
  Building,
  X
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const menuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: BarChart3,
    path: '/',
    shortcut: 'G D',
    roles: ['OWNER', 'ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']
  },
  {
    id: 'employees',
    label: 'Employees',
    icon: Users,
    path: '/admin/employees',
    shortcut: 'G E',
    roles: ['OWNER', 'ADMIN', 'HR']
  },
  {
    id: 'timesheets',
    label: 'Timesheets',
    icon: Clock,
    path: '/employee/timesheets',
    shortcut: 'G T',
    roles: ['OWNER', 'ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']
  },
  {
    id: 'leave',
    label: 'Leave Management',
    icon: Calendar,
    path: '/employee/leave',
    shortcut: 'G L',
    roles: ['OWNER', 'ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']
  },
  {
    id: 'team-calendar',
    label: 'Team Calendar',
    icon: Calendar,
    path: '/employee/leave/calendar',
    shortcut: 'G C',
    roles: ['OWNER', 'ADMIN', 'HR', 'MANAGER']
  },
  {
    id: 'payroll',
    label: 'Payroll',
    icon: DollarSign,
    path: '/admin/payroll',
    shortcut: 'G P',
    roles: ['OWNER', 'ADMIN', 'HR']
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FileText,
    path: '/employee/documents',
    shortcut: 'G D',
    roles: ['OWNER', 'ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']
  }
];

const adminItems = [
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/admin/settings',
    shortcut: 'G S',
    roles: ['OWNER', 'ADMIN', 'HR']
  }
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setUserRole(user.role);
    }
  }, [user]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  const canAccessItem = (item: any) => {
    if (!userRole) return false;
    return item.roles.includes(userRole);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" 
          onClick={onClose}
          data-testid="sidebar-overlay"
        />
      )}
      
      {/* Sidebar */}
      <div className={`${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed inset-y-0 left-0 z-50 w-72 transform transition-transform lg:translate-x-0 lg:relative lg:inset-auto bg-background border-r`} data-testid="sidebar">
        <div className="flex-1 flex flex-col min-h-0">
          {/* Mobile close button */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b">
            <span className="text-lg font-semibold">Menu</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              data-testid="button-close-sidebar"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        {/* Logo and Company */}
        <div className="flex items-center space-x-3 p-4 border-b">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">N</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground" data-testid="text-app-title">
              Nest HR
            </h1>
            <p className="text-xs text-muted-foreground" data-testid="text-company-name">
              Enterprise Solutions
            </p>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-medium text-sm">
                {user?.name?.charAt(0) || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate" data-testid="text-user-name">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-muted-foreground" data-testid="text-user-role">
                {user?.isAdmin ? "Administrator" : "Employee"}
              </p>
            </div>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto">
          <nav className="px-4 py-2 space-y-1">
            {user?.isAdmin && (
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" data-testid="text-admin-section">
                  Admin
                </h3>
                <div className="mt-2 space-y-1">
                  {adminItems.map((item) => {
                    if (!canAccessItem(item)) return null;

                    const Icon = item.icon;
                    const active = isActive(item.path);

                    return (
                      <Link
                        key={item.id}
                        href={item.path}
                        className={`${
                          active
                            ? "bg-primary/20 text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        } group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors`}
                        data-testid={`nav-${item.id}`}
                      >
                        <Icon className="mr-3 h-5 w-5" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
            {menuItems.map((item) => {
              if (!canAccessItem(item)) return null;

              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link key={item.id} href={item.path}>
                  <Button
                    variant={active ? "default" : "ghost"}
                    className={`w-full justify-start h-10 px-3 ${
                      active 
                        ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                    data-testid={`nav-${item.id}`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                    <span className={`ml-auto text-xs px-1.5 py-0.5 rounded ${
                      active 
                        ? "bg-primary-foreground/20 text-primary-foreground" 
                        : "text-muted-foreground"
                    }`}>
                      {item.shortcut}
                    </span>
                  </Button>
                </Link>
              );
            })}
          </nav>
        </nav>
        </div>
      </div>
    </>
  );
}
