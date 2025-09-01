import React, { useState } from "react";
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
  Home,
  Building2,
  Moon,
  Sun,
  Clock,
  MessageSquare,
  Network,
  Calendar,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserProfile } from "@/components/auth/user-profile";
import { useTheme } from "@/components/theme-provider";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export default function AdminHeader() {
  const pathname = usePathname() || '';
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationCount] = useState(3);

  const { theme, toggleTheme } = useTheme();

  // Admin navigation items with submenus
  const navigationItems = [
    { 
      href: "/admin/dashboard", 
      label: "Dashboard", 
      icon: Home, 
      active: pathname === "/admin/dashboard" 
    },
    { 
      href: "/admin/people/list", 
      label: "People", 
      icon: Users, 
      active: pathname.startsWith("/admin/people"),
      submenu: [
        { href: "/admin/people/list", label: "List", icon: Users },
        { href: "/admin/people/teams", label: "Teams", icon: Building2 },
        { href: "/admin/people/org-chart", label: "Org Chart", icon: Network }
      ]
    },
    { 
      href: "/admin/workload/leave", 
      label: "Workload", 
      icon: Clock, 
      active: pathname.startsWith("/admin/workload"),
      submenu: [
        { href: "/admin/workload/leave", label: "Leave/Absence", icon: Calendar },
        { href: "/admin/workload/timesheet", label: "Timesheet", icon: Clock }
      ]
    },
    { 
      href: "/admin/engage/meetings", 
      label: "Engage", 
      icon: MessageSquare, 
      active: pathname.startsWith("/admin/engage"),
      submenu: [
        { href: "/admin/engage/meetings", label: "Meetings", icon: MessageSquare },
        { href: "/admin/engage/reviews", label: "Review Cycle", icon: Star }
      ]
    },
    { 
      href: "/admin/settings", 
      label: "Settings", 
      icon: Settings, 
      active: pathname.startsWith("/admin/settings") 
    },
  ];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // TODO: Implement search functionality
  };

  const handleNotifications = () => {
    // TODO: Implement notifications panel
  };

  return (
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
          <div className="flex ml-8">
            <NavigationMenu>
              <NavigationMenuList>
              {navigationItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  {item.submenu ? (
                    <>
                      <NavigationMenuTrigger className={cn(
                        "h-10 px-3 py-2 bg-transparent hover:bg-muted data-[active]:bg-primary data-[active]:text-primary-foreground",
                        item.active && "bg-primary text-primary-foreground"
                      )}>
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                          {item.submenu.map((subItem) => (
                            <ListItem
                              key={subItem.href}
                              href={subItem.href}
                              title={subItem.label}
                              icon={subItem.icon}
                            >
                              Navigate to {subItem.label}
                            </ListItem>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <NavigationMenuLink asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
                          item.active && "bg-primary text-primary-foreground hover:bg-primary/90"
                        )}
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </Link>
                    </NavigationMenuLink>
                  )}
                </NavigationMenuItem>
              ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
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

          {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleTheme}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted h-9 w-9"
            data-testid="button-theme-toggle"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
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
          <div className="relative">
            <UserProfile />
          </div>
        </div>
      </div>
    </header>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
  }
>(({ className, title, icon: Icon, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4" />
            <div className="text-sm font-medium leading-none">{title}</div>
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";