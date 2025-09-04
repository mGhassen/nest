"use client"

import {
  BadgeCheck,
  Bell,
  LogOut,
  Sparkles,
  Crown,
  Shield,
  Users,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { getInitials } from "@/lib/auth"
import { usePathname, useRouter } from "next/navigation"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { CaretSortIcon, ComponentPlaceholderIcon } from "@radix-ui/react-icons"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
    role?: string
  }
}) {
  const { isMobile } = useSidebar()
  const { logout, user: authUser } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  
  // Determine current portal and permissions
  const currentPortal = pathname.startsWith('/admin') ? 'admin' : 'employee'
  const isAdmin = authUser?.currentCompany?.is_admin || false
  const hasEmployeeAccess = true // For now, assume all users have employee access
  const canSwitchPortals = isAdmin && hasEmployeeAccess

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handlePortalSwitch = (portal: 'admin' | 'employee') => {
    if (portal === 'admin') {
      router.push('/admin/dashboard')
    } else {
      router.push('/employee/dashboard')
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    tooltip={user.name}
                  >
                    <div className="relative">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                          {getInitials(user.name.split(' ')[0] || "A", user.name.split(' ')[1] || "")}
                        </AvatarFallback>
                      </Avatar>
                      {user.role === 'SUPERUSER' && (
                        <div className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                          <Crown className="h-2.5 w-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user.name}</span>
                      <span className="truncate text-xs">{user.email}</span>
                    </div>
                    <CaretSortIcon className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="right" align="center">
                {user.name}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <div className="relative">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                      {getInitials(user.name.split(' ')[0] || "A", user.name.split(' ')[1] || "")}
                    </AvatarFallback>
                  </Avatar>
                  {user.role === 'SUPERUSER' && (
                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                      <Crown className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {canSwitchPortals && (
              <>
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-muted-foreground text-xs">
                    Portal Access
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => handlePortalSwitch('admin')}
                    className={currentPortal === 'admin' ? 'bg-accent' : ''}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Portal
                    {currentPortal === 'admin' && (
                      <span className="ml-auto text-xs text-muted-foreground">Current</span>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handlePortalSwitch('employee')}
                    className={currentPortal === 'employee' ? 'bg-accent' : ''}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Employee Portal
                    {currentPortal === 'employee' && (
                      <span className="ml-auto text-xs text-muted-foreground">Current</span>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck className="mr-2 h-4 w-4" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ComponentPlaceholderIcon className="mr-2 h-4 w-4" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
