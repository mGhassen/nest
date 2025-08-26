import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Bell, 
  Settings,
  Plus,
  Users,
  Clock,
  Shield,
  FileText,
  Home,
  CalendarDays,
  DollarSign,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserProfile } from "@/components/auth/user-profile";

export default function AdminHeader() {
  const pathname = usePathname() || '';
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationCount] = useState(3);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Admin-specific navigation items
  const navigationItems = [
    {
      group: "Admin",
      items: [
        { href: "/admin/dashboard", label: "Dashboard", icon: Home, active: pathname === "/admin/dashboard" },
        { href: "/admin/employees", label: "Employees", icon: Users, active: pathname.startsWith("/admin/employees") },
        { href: "/admin/payroll", label: "Payroll", icon: DollarSign, active: pathname.startsWith("/admin/payroll") },
        { href: "/admin/settings", label: "Settings", icon: Settings, active: pathname.startsWith("/admin/settings") },
      ]
    }
  ];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // TODO: Implement search functionality
  };

  const handleNotifications = () => {
    // TODO: Implement notifications panel
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className="bg-background border-b h-16 sticky top-0 z-40" data-testid="admin-header">
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          <div className="flex items-center space-x-4">
            {/* Logo */}
            <Link href="/admin/dashboard">
              <div className="flex items-center space-x-3 cursor-pointer">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-semibold text-foreground hidden sm:block" data-testid="text-logo">
                  Nest HR Admin
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1 ml-8">
              {navigationItems[0].items.map((item) => (
                <Link key={item.href} href={item.href}>
                  <div className="group relative">
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "w-10 h-10 p-0 rounded-lg transition-all duration-200 group-hover:w-auto group-hover:px-3",
                        item.active 
                          ? "w-auto px-3 bg-primary text-primary-foreground hover:bg-primary/90" 
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                      data-testid={`nav-${item.href.slice(1).replace(/\//g, '-')}`}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className={cn(
                        "ml-2 text-sm font-medium transition-all duration-200 whitespace-nowrap overflow-hidden",
                        item.active 
                          ? "inline-block w-auto" 
                          : "w-0 group-hover:w-auto group-hover:inline-block"
                      )}>
                        {item.label}
                      </span>
                    </Button>
                    
                    {/* Tooltip for non-active items */}
                    {!item.active && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        {item.label}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-2">
            {/* Search */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search employees, documents..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-64 h-9 pl-9 pr-3 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                data-testid="input-admin-search"
              />
            </div>

            {/* Mobile search */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="sm:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-muted"
              data-testid="button-mobile-search"
            >
              <Search className="w-5 h-5" />
            </Button>

            {/* Quick Actions */}
            <Button 
              variant="ghost" 
              size="sm"
              className="hidden md:flex items-center space-x-1 px-3 py-2 h-9 text-muted-foreground hover:text-foreground hover:bg-muted"
              data-testid="button-quick-action"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Add</span>
            </Button>

            {/* Notifications */}
            <div className="relative">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleNotifications}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted relative h-9 w-9"
                data-testid="button-notifications"
              >
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" data-testid="notification-dot"></span>
                )}
              </Button>
            </div>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <UserProfile />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div className="lg:hidden">
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setUserMenuOpen(false)} />
        <div className="fixed inset-y-0 left-0 z-50 w-80 bg-background shadow-xl">
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold">Nest HR Admin</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUserMenuOpen(false)}
              className="p-2"
            >
              <span className="sr-only">Close menu</span>
              <span className="text-2xl">&times;</span>
            </Button>
          </div>

          <div className="py-4">
            {/* Mobile Search */}
            <div className="px-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full h-10 pl-9 pr-3 border rounded-md text-sm"
                />
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="space-y-1">
              {navigationItems.map((group) => (
                <div key={group.group} className="px-4 py-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    {group.group}
                  </div>
                  <div className="space-y-1">
                    {group.items.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <Button
                          variant="ghost"
                          onClick={() => setUserMenuOpen(false)}
                          className={cn(
                            "w-full justify-start text-left h-10 px-3",
                            item.active 
                              ? "bg-primary/20 text-primary border-r-2 border-primary" 
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          )}
                        >
                          <item.icon className="w-5 h-5 mr-3" />
                          {item.label}
                        </Button>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}
