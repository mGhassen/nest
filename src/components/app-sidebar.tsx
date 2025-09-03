import * as React from "react"
import {
  Dumbbell,
  LayoutDashboard,
  Users,
  UserPlus,
  DollarSign,
  Building2,
  Network,
  Clock,
  Calendar,
  MessageSquare,
  Star,
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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const pathname = usePathname()

  const data = {
    user: {
      name: user ? `${user.firstName} ${user.lastName}` : "Admin",
      email: user?.email || "admin@example.com",
      avatar: "",
    },
    navMain: [
      {
        title: "Dashboard",
        url: "/admin/dashboard",
        icon: LayoutDashboard,
        isActive: pathname === "/admin/dashboard",
      },
      {
        title: "People",
        url: "/admin/people/list",
        icon: Users,
        isActive: pathname.startsWith("/admin/people"),
        items: [
          {
            title: "List",
            url: "/admin/people/list",
          },
          {
            title: "Teams",
            url: "/admin/people/teams",
          },
          {
            title: "Org Chart",
            url: "/admin/people/org-chart",
          },
        ],
      },
      {
        title: "Workload",
        url: "/admin/workload/leave",
        icon: Clock,
        isActive: pathname.startsWith("/admin/workload"),
        items: [
          {
            title: "Leave/Absence",
            url: "/admin/workload/leave",
          },
          {
            title: "Timesheet",
            url: "/admin/workload/timesheet",
          },
        ],
      },
      {
        title: "Engage",
        url: "/admin/engage/meetings",
        icon: MessageSquare,
        isActive: pathname.startsWith("/admin/engage"),
        items: [
          {
            title: "Meetings",
            url: "/admin/engage/meetings",
          },
          {
            title: "Review Cycle",
            url: "/admin/engage/reviews",
          },
        ],
      },
      {
        title: "Settings",
        url: "/admin/settings",
        icon: Settings,
        isActive: pathname.startsWith("/admin/settings"),
        items: [
          {
            title: "General",
            url: "/admin/settings",
          },
          {
            title: "Account Management",
            url: "/admin/settings/accounts",
          },
        ],
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
        {/* Company Switcher only - no logo/name */}
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
