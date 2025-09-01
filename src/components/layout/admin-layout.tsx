"use client";

import { usePathname } from 'next/navigation';
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Dumbbell, 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  CreditCard, 
  LogOut,
  Menu,
  Sun,
  Moon,
  ChevronDown,
  Settings,
  Clock,
  MessageSquare,
  Network,
  Building2,
  Calendar,
  Star
} from "lucide-react";
import { getInitials } from "@/lib/auth";
import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigation = [
    { 
      name: "Dashboard", 
      href: "/admin/dashboard", 
      icon: LayoutDashboard,
      description: "Overview and analytics"
    },
    { 
      name: "People", 
      href: "/admin/people/list", 
      icon: Users,
      description: "Manage team members and organization",
      submenu: [
        { name: "List", href: "/admin/people/list", description: "Employee directory", icon: Users },
        { name: "Teams", href: "/admin/people/teams", description: "Team management", icon: Building2 },
        { name: "Org Chart", href: "/admin/people/org-chart", description: "Organization structure", icon: Network }
      ]
    },
    { 
      name: "Workload", 
      href: "/admin/workload/leave", 
      icon: Clock,
      description: "Leave and timesheet management",
      submenu: [
        { name: "Leave/Absence", href: "/admin/workload/leave", description: "Leave requests and approvals", icon: Calendar },
        { name: "Timesheet", href: "/admin/workload/timesheet", description: "Timesheet validation and management", icon: Clock }
      ]
    },
    { 
      name: "Engage", 
      href: "/admin/engage/meetings", 
      icon: MessageSquare,
      description: "Meetings and performance reviews",
      submenu: [
        { name: "Meetings", href: "/admin/engage/meetings", description: "Meeting management", icon: MessageSquare },
        { name: "Review Cycle", href: "/admin/engage/reviews", description: "Performance reviews", icon: Star }
      ]
    },
    { 
      name: "Settings", 
      href: "/admin/settings", 
      icon: Settings,
      description: "System configuration"
    },
  ];

  const isActive = (href: string) => {
    if (href === "/admin/dashboard") {
      return pathname === "/admin/dashboard";
    }
    return pathname.startsWith(href);
  };

  const handleNavigationClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm shadow-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-all duration-200 group">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <Dumbbell className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Nest HR</h1>
                  <p className="text-xs text-muted-foreground -mt-1">Admin Portal</p>
                </div>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <NavigationMenu className="hidden lg:flex">
              <NavigationMenuList>
                {navigation.map((item) => (
                  <NavigationMenuItem key={item.name}>
                    {item.submenu ? (
                      <>
                        <NavigationMenuTrigger className={cn(
                          "h-10 px-3 py-2 bg-transparent hover:bg-muted data-[active]:bg-primary data-[active]:text-primary-foreground",
                          isActive(item.href) && "bg-primary text-primary-foreground"
                        )}>
                          <item.icon className="mr-2 h-4 w-4" />
                          {item.name}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                            {item.submenu.map((subItem) => (
                              <ListItem
                                key={subItem.href}
                                href={subItem.href}
                                title={subItem.name}
                                icon={subItem.icon}
                              >
                                {subItem.description}
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
                            isActive(item.href) && "bg-primary text-primary-foreground hover:bg-primary/90"
                          )}
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          {item.name}
                        </Link>
                      </NavigationMenuLink>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
            
            {/* User Section */}
            <div className="flex items-center space-x-3">
              {/* Theme toggle button - visible on all screens */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
                {theme === "light" ? (
                  <Moon className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                ) : (
                  <Sun className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                )}
              </Button>

              {/* Mobile menu button */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                  <SheetHeader className="pb-6">
                    <SheetTitle className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                        <Dumbbell className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <span className="text-lg font-bold">WildEnergy</span>
                        <p className="text-xs text-muted-foreground">Admin Portal</p>
                      </div>
                    </SheetTitle>
                  </SheetHeader>
                  
                  {/* User Profile in Mobile Menu */}
                  <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg mb-6">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user ? getInitials(user.firstName || "A", user.lastName || "") : "A"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {user ? `${user.firstName} ${user.lastName}` : "Admin"}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">Admin</Badge>
                        <span className="text-xs text-muted-foreground">Administrator</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {navigation.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link key={item.name} href={item.href} onClick={handleNavigationClick}>
                          <div
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                              isActive(item.href)
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <div className="flex-1">
                              <div>{item.name}</div>
                              <div className="text-xs opacity-70">{item.description}</div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  
                  <div className="absolute bottom-4 left-4 right-4 space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start text-red-600 hover:text-red-700"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Logout
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Desktop user profile */}
              <div className="hidden lg:flex items-center space-x-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-3 p-2 hover:bg-accent/50">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {user ? getInitials(user.firstName || "A", user.lastName || "") : "A"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="text-sm font-medium text-foreground">
                          {user ? `${user.firstName} ${user.lastName}` : "Admin"}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">Admin</Badge>
                          <span className="text-xs text-muted-foreground">Administrator</span>
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium">{user ? `${user.firstName} ${user.lastName}` : "Admin"}</p>
                      <p className="text-xs text-muted-foreground">{user?.email || "admin@example.com"}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin/settings">
                        <Settings className="w-4 h-4 mr-3" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={toggleTheme}>
                      {theme === "light" ? (
                        <>
                          <Moon className="w-4 h-4 mr-3" />
                          Dark Mode
                        </>
                      ) : (
                        <>
                          <Sun className="w-4 h-4 mr-3" />
                          Light Mode
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="w-4 h-4 mr-3" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
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
