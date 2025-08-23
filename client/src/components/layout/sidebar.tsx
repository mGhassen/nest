import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
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
import { useAuth } from "@/hooks/useAuth";
import { can } from "@/lib/rbac";

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
    path: '/employees',
    shortcut: 'G E',
    roles: ['OWNER', 'ADMIN', 'HR', 'MANAGER']
  },
  {
    id: 'timesheets',
    label: 'Timesheets',
    icon: Clock,
    path: '/timesheets',
    shortcut: 'G T',
    roles: ['OWNER', 'ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']
  },
  {
    id: 'leave',
    label: 'Leave Management',
    icon: Calendar,
    path: '/leave',
    shortcut: 'G L',
    roles: ['OWNER', 'ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']
  },
  {
    id: 'team-calendar',
    label: 'Team Calendar',
    icon: Calendar,
    path: '/team-calendar',
    shortcut: 'G C',
    roles: ['OWNER', 'ADMIN', 'HR', 'MANAGER']
  },
  {
    id: 'payroll',
    label: 'Payroll',
    icon: DollarSign,
    path: '/payroll',
    shortcut: 'G P',
    roles: ['OWNER', 'ADMIN', 'HR']
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FileText,
    path: '/documents',
    shortcut: 'G D',
    roles: ['OWNER', 'ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']
  }
];

const adminItems = [
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/settings',
    shortcut: 'G S',
    roles: ['OWNER', 'ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']
  }
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role) {
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
      return location === '/';
    }
    return location.startsWith(path);
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
      } fixed inset-y-0 left-0 z-50 w-72 transform transition-transform lg:translate-x-0 lg:relative lg:inset-auto bg-white border-r border-gray-200`} data-testid="sidebar">
        <div className="flex-1 flex flex-col min-h-0">
          {/* Mobile close button */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200">
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
        <div className="flex items-center px-6 py-4 border-b border-gray-200" data-testid="sidebar-header">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900" data-testid="text-app-title">
                PayfitLite
              </h1>
              <p className="text-xs text-gray-500" data-testid="text-company-name">
                DemoCo Ltd
              </p>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="px-6 py-4 border-b border-gray-200" data-testid="sidebar-user-profile">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm" data-testid="text-user-initials">
                {user ? getInitials(`${user.firstName || ''} ${user.lastName || ''}`) : 'JD'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate" data-testid="text-user-name">
                {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'John Doe'}
              </p>
              <p className="text-xs text-gray-500" data-testid="text-user-role">
                {userRole === 'ADMIN' ? 'Administrator' : userRole}
              </p>
            </div>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-4 space-y-2" data-testid="sidebar-navigation">
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
                      ? "bg-primary text-white hover:bg-primary/90" 
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  data-testid={`nav-${item.id}`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                  <span className={`ml-auto text-xs px-1.5 py-0.5 rounded ${
                    active 
                      ? "bg-white/20 text-white" 
                      : "text-gray-400"
                  }`}>
                    {item.shortcut}
                  </span>
                </Button>
              </Link>
            );
          })}

          {/* Admin Section */}
          <div className="pt-4">
            <div className="px-3 py-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider" data-testid="text-admin-section">
                Administration
              </h3>
            </div>
            {adminItems.map((item) => {
              if (!canAccessItem(item)) return null;

              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link key={item.id} href={item.path}>
                  <Button
                    variant={active ? "default" : "ghost"}
                    className={`w-full justify-start h-10 px-3 ${
                      active 
                        ? "bg-primary text-white hover:bg-primary/90" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    data-testid={`nav-${item.id}`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                    <span className={`ml-auto text-xs px-1.5 py-0.5 rounded ${
                      active 
                        ? "bg-white/20 text-white" 
                        : "text-gray-400"
                    }`}>
                      {item.shortcut}
                    </span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </nav>
        </div>
      </div>
    </>
  );
}
