import * as React from "react"
import {
  LayoutDashboard,
  Clock,
  Calendar,
  User,
  Settings,
  LifeBuoy,
  Send,
} from "lucide-react"
import { usePathname } from "next/navigation"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { CompanySwitcher } from "@/components/company-switcher"
import { useAuth } from "@/hooks/use-auth"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

export function EmployeeSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const pathname = usePathname()

  const data = {
    user: {
      name: user ? `${user.firstName} ${user.lastName}` : "Employee",
      email: user?.email || "employee@example.com",
      avatar: "",
      role: user?.role,
    },
    navMain: [
      {
        title: "Dashboard",
        url: "/employee/dashboard",
        icon: LayoutDashboard,
        isActive: pathname === "/employee/dashboard",
      },
      {
        title: "Timesheet",
        url: "/employee/timesheet",
        icon: Clock,
        isActive: pathname.startsWith("/employee/timesheet"),
      },
      {
        title: "Leave",
        url: "/employee/leave",
        icon: Calendar,
        isActive: pathname.startsWith("/employee/leave"),
      },
      {
        title: "Profile",
        url: "/employee/profile",
        icon: User,
        isActive: pathname.startsWith("/employee/profile"),
      },
      {
        title: "Settings",
        url: "/employee/settings",
        icon: Settings,
        isActive: pathname.startsWith("/employee/settings"),
      },
    ],
    navSecondary: [
      {
        title: "Support",
        url: "#",
        icon: LifeBuoy,
      },
      {
        title: "Feedback",
        url: "#",
        icon: Send,
      },
    ],
  }

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        {/* Company Switcher only */}
        {user && <CompanySwitcher />}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
