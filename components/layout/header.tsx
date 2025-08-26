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
  ChevronDown,
  User,
  LogOut,
  Menu,
  X,
  Users,
  Clock,
  Shield,
  FileText,
  Home,
  CalendarDays,
  DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserProfile } from "@/components/auth/user-profile";

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const pathname = usePathname() || '';
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationCount] = useState(3);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Navigation items with better grouping
  const navigationItems = [
    {
      group: "Core",
      items: [
        { href: "/", label: "Dashboard", icon: Home, active: pathname === "/" },
        { href: "/employees", label: "People", icon: Users, active: pathname.startsWith("/employees") },
        { href: "/timesheets", label: "Time & Attendance", icon: Clock, active: pathname.startsWith("/timesheets") },
        { href: "/leave", label: "Leave Management", icon: CalendarDays, active: pathname.startsWith("/leave") },
        { href: "/payroll", label: "Payroll", icon: DollarSign, active: pathname.startsWith("/payroll") },
      ]
    },
    {
      group: "Operations",
      items: [
        { href: "/documents", label: "Documents", icon: FileText, active: pathname.startsWith("/documents") },
        { href: "/settings", label: "Settings", icon: Settings, active: pathname.startsWith("/settings") },
      ]
    }
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // TODO: Implement search functionality
  };

  const handleNotifications = () => {
    // TODO: Implement notifications panel
  };

  const handleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    // TODO: Persist dark mode preference
  };

  const handleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
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

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  return (
    <>
      <header className="bg-background border-b h-16 sticky top-0 z-40" data-testid="header">
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>

            {/* Logo */}
            <Link href="/">
              <div className="flex items-center space-x-3 cursor-pointer">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="text-xl font-semibold text-gray-900 hidden sm:block" data-testid="text-logo">
                  PayfitLite
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
                          ? "w-auto px-3 bg-gray-900 text-white hover:bg-gray-800" 
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                      )}
                      data-testid={`nav-${item.href.slice(1) || 'dashboard'}`}
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search employees, documents..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-64 h-9 pl-9 pr-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                data-testid="input-global-search"
              />
            </div>

            {/* Mobile search */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="sm:hidden p-2 text-gray-400 hover:text-gray-600"
              data-testid="button-mobile-search"
            >
              <Search className="w-5 h-5" />
            </Button>

            {/* Quick Actions */}
            <Button 
              variant="ghost" 
              size="sm"
              className="hidden md:flex items-center space-x-1 px-3 py-2 h-9 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
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
                className="p-2 text-gray-400 hover:text-gray-600 relative h-9 w-9"
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
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-80 bg-background shadow-xl">
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="text-xl font-semibold text-gray-900">PayfitLite</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="py-4">
              {/* Mobile Search */}
              <div className="px-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full h-10 pl-9 pr-3 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>

              {/* Mobile Navigation */}
              <nav className="space-y-1">
                {navigationItems.map((group) => (
                  <div key={group.group} className="px-4 py-2">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      {group.group}
                    </div>
                    <div className="space-y-1">
                      {group.items.map((item) => (
                        <Link key={item.href} href={item.href}>
                          <Button
                            variant="ghost"
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              "w-full justify-start text-left h-10 px-3",
                              item.active 
                                ? "bg-gray-100 text-gray-900" 
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
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
      )}
    </>
  );
}
