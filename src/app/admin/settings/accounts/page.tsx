"use client";

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useAccountsList, useAccountCreate, useAccountPasswordReset, useAccountStatusUpdate } from "@/hooks/use-accounts";
import AdminLayout from "@/components/layout/admin-layout";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingPage } from "@/components/ui/loading-spinner";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { 
  Key, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Search,
  Filter,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  MoreVertical,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  X,
  Trash2,
  Archive,
  Ban
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Account {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'ADMIN' | 'EMPLOYEE';
  account_status?: 'ACTIVE' | 'PENDING_SETUP' | 'PASSWORD_RESET_PENDING' | 'PASSWORD_RESET_COMPLETED' | 'SUSPENDED' | 'INACTIVE';
  is_active: boolean;
  last_login: string | null;
  password_reset_requested_at?: string | null;
  password_reset_completed_at?: string | null;
  last_password_change_at?: string | null;
  failed_login_attempts?: number;
  locked_until?: string | null;
  created_at: string;
  updated_at: string;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    position_title: string;
    status: string;
  };
}

export default function AccountManagementPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'admin' as 'admin' | 'employee'
  });

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/auth/login");
    } else if (!user.isAdmin) {
      router.replace("/unauthorized");
    }
  }, [user, isLoading, router]);

  // Fetch accounts using proper hook
  const { data: accounts = [], isLoading: accountsLoading, refetch: refetchAccounts } = useAccountsList();
  
  // Hooks for account actions
  const createAccount = useAccountCreate();
  const passwordReset = useAccountPasswordReset();
  const updateStatus = useAccountStatusUpdate();

  // Filter and sort accounts
  const filteredAndSortedAccounts = accounts
    .filter((account: Account) => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = (
          account.first_name?.toLowerCase().includes(query) ||
          account.last_name?.toLowerCase().includes(query) ||
          account.email?.toLowerCase().includes(query) ||
          `${account.first_name} ${account.last_name}`.toLowerCase().includes(query)
        );
        if (!matchesSearch) return false;
      }
      
      // Status filter
      if (statusFilter) {
        const currentStatus = account.account_status || (account.is_active ? 'ACTIVE' : 'INACTIVE');
        if (currentStatus !== statusFilter) {
          return false;
        }
      }
      
      // Role filter
      if (roleFilter && account.role !== roleFilter) {
        return false;
      }
      
      return true;
    })
    .sort((a: Account, b: Account) => {
      if (!sortField) return 0;
      
      let aValue: any = a[sortField as keyof typeof a];
      let bValue: any = b[sortField as keyof typeof b];
      
      // Handle null/undefined values
      if (aValue == null) aValue = "";
      if (bValue == null) bValue = "";
      
      // Handle date fields
      if (sortField === "created_at" || sortField === "last_login") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      // Handle string fields
      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  // Pagination logic
  const totalItems = filteredAndSortedAccounts.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedAccounts = filteredAndSortedAccounts.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, roleFilter, sortField, sortDirection]);

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Get sort icon for a field
  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setRoleFilter("");
    setSortField("");
    setSortDirection("asc");
    setCurrentPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery || statusFilter || roleFilter || sortField;

  // Bulk selection handlers
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedAccounts(new Set(paginatedAccounts.map((acc: Account) => acc.id)));
    } else {
      setSelectedAccounts(new Set());
    }
  };

  const handleSelectAccount = (accountId: string, checked: boolean) => {
    const newSelected = new Set(selectedAccounts);
    if (checked) {
      newSelected.add(accountId);
    } else {
      newSelected.delete(accountId);
    }
    setSelectedAccounts(newSelected);
    setSelectAll(newSelected.size === paginatedAccounts.length && paginatedAccounts.length > 0);
  };

  const getStatusBadge = (account: Account) => {
    // Use account_status if available, otherwise derive from is_active
    const status = account.account_status || (account.is_active ? 'ACTIVE' : 'INACTIVE');
    
    const statusConfig = {
      'ACTIVE': { color: 'bg-green-100 text-green-800', icon: UserCheck, label: 'Active' },
      'PENDING_SETUP': { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Setup' },
      'PASSWORD_RESET_PENDING': { color: 'bg-blue-100 text-blue-800', icon: RefreshCw, label: 'Reset' },
      'PASSWORD_RESET_COMPLETED': { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Ready' },
      'SUSPENDED': { color: 'bg-red-100 text-red-800', icon: UserX, label: 'Suspended' },
      'INACTIVE': { color: 'bg-gray-100 text-gray-800', icon: EyeOff, label: 'Inactive' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.INACTIVE;
    const Icon = config.icon;
    
    return (
      <Badge className={config.color} title={status.replace(/_/g, ' ')}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    return (
      <Badge variant={role === 'ADMIN' ? 'default' : 'secondary'}>
        {role}
      </Badge>
    );
  };

  const handlePasswordReset = (account: Account) => {
    if (confirm(`Send password reset email to ${account.first_name} ${account.last_name} (${account.email})?`)) {
      passwordReset.mutate(account.id, {
        onSuccess: () => {
          toast({
            title: "Password reset email sent",
            description: `A password reset email has been sent to ${account.email}`,
          });
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.message || "Failed to send password reset email",
            variant: "destructive",
          });
        }
      });
    }
  };

  const handleSuspendAccount = (account: Account) => {
    const currentStatus = account.account_status || (account.is_active ? 'ACTIVE' : 'INACTIVE');
    const action = currentStatus === 'SUSPENDED' ? 'activate' : 'suspend';
    const newStatus = currentStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    
    if (confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} account for ${account.first_name} ${account.last_name}?`)) {
      updateStatus.mutate({ accountId: account.id, status: newStatus }, {
        onSuccess: () => {
          toast({
            title: `Account ${action}d`,
            description: `Account for ${account.first_name} ${account.last_name} has been ${action}d.`,
          });
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.message || `Failed to ${action} account`,
            variant: "destructive",
          });
        }
      });
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewUser(prev => ({ ...prev, password }));
  };

  const handleCreateUser = () => {
    if (!newUser.email || !newUser.password || !newUser.firstName || !newUser.lastName) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createAccount.mutate({
      email: newUser.email,
      password: newUser.password,
      first_name: newUser.firstName,
      last_name: newUser.lastName,
      role: newUser.role.toUpperCase() as 'ADMIN' | 'EMPLOYEE'
    }, {
      onSuccess: () => {
        toast({
          title: "User created successfully",
          description: `New ${newUser.role} account has been created for ${newUser.email}`,
        });

        // Reset form and close dialog
        setNewUser({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          role: 'admin'
        });
        setShowCreateDialog(false);
      },
      onError: (error: any) => {
        console.error('Error creating user:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to create user",
          variant: "destructive",
        });
      }
    });
  };

  // Bulk action handlers
  const handleBulkSuspend = () => {
    if (selectedAccounts.size === 0) return;
    
    if (confirm(`Are you sure you want to suspend ${selectedAccounts.size} account(s)?`)) {
      const suspendPromises = Array.from(selectedAccounts).map(id => {
        const account = accounts.find((acc: Account) => acc.id === id);
        if (!account) return Promise.resolve();
        
        return fetch(`/api/admin/accounts/${id}/status`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'SUSPENDED' }),
        });
      });
      
      Promise.all(suspendPromises)
        .then(() => {
          toast({
            title: "Accounts suspended",
            description: `${selectedAccounts.size} account(s) have been successfully suspended.`,
          });
          setSelectedAccounts(new Set());
          setSelectAll(false);
          refetchAccounts();
        })
        .catch((error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to suspend some accounts.",
            variant: "destructive",
          });
        });
    }
  };

  if (isLoading || accountsLoading) {
    return <LoadingPage />;
  }

  if (!user || !user.isAdmin) {
    return null;
  }

  // Check if the new database fields are available
  const hasNewFields = accounts && accounts.length > 0 && accounts[0].hasOwnProperty('account_status');

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Account Management</h2>
            <p className="text-muted-foreground">
              Manage user accounts and authentication status
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filter
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {[searchQuery, statusFilter, roleFilter].filter(Boolean).length}
                </Badge>
              )}
            </Button>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Account
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Account</DialogTitle>
                  <DialogDescription>
                    Create a new user account. This user will be able to login but won't have an employee record.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="firstName" className="text-right">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      value={newUser.firstName}
                      onChange={(e) => setNewUser(prev => ({ ...prev, firstName: e.target.value }))}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="lastName" className="text-right">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      value={newUser.lastName}
                      onChange={(e) => setNewUser(prev => ({ ...prev, lastName: e.target.value }))}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">
                      Password
                    </Label>
                    <div className="col-span-3 flex space-x-2">
                      <Input
                        id="password"
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" onClick={generatePassword}>
                        Generate
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right">
                      Role
                    </Label>
                    <Select value={newUser.role} onValueChange={(value: 'admin' | 'employee') => setNewUser(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="employee">Employee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleCreateUser} disabled={createAccount.isPending}>
                    {createAccount.isPending ? "Creating..." : "Create Account"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {!hasNewFields && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Database Migration Required:</strong> To enable full account status tracking and password reset monitoring, 
              please run the database migration: <code>npx supabase db reset</code> or apply the migration file 
              <code>20250127000000_add_account_status_tracking.sql</code>. 
              Currently showing basic account information only.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Search and Filter Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search accounts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-4 py-2 w-full border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-sm text-muted-foreground">
                {hasActiveFilters ? (
                  <>
                    {filteredAndSortedAccounts.length} of {accounts.length} accounts
                  </>
                ) : (
                  <>
                    {accounts.length} accounts
                  </>
                )}
              </div>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8 px-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="rounded-lg border bg-card p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="PENDING_SETUP">Setup</SelectItem>
                      <SelectItem value="PASSWORD_RESET_PENDING">Reset</SelectItem>
                      <SelectItem value="PASSWORD_RESET_COMPLETED">Ready</SelectItem>
                      <SelectItem value="SUSPENDED">Suspended</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Role</label>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All roles</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="EMPLOYEE">Employee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Page Size</label>
                  <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 per page</SelectItem>
                      <SelectItem value="10">10 per page</SelectItem>
                      <SelectItem value="25">25 per page</SelectItem>
                      <SelectItem value="50">50 per page</SelectItem>
                      <SelectItem value="100">100 per page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bulk Actions Bar */}
        {selectedAccounts.size > 0 && (
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">
                  {selectedAccounts.size} account(s) selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedAccounts(new Set());
                    setSelectAll(false);
                  }}
                  className="h-8 px-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkSuspend}
                  className="h-8"
                >
                  <Ban className="mr-2 h-4 w-4" />
                  Suspend
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide w-80">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <button
                        className="flex items-center space-x-1 hover:text-foreground transition-colors"
                        onClick={() => handleSort('first_name')}
                      >
                        <span>User & Employee</span>
                        {getSortIcon('first_name')}
                      </button>
                    </div>
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide w-20">
                    <button
                      className="flex items-center space-x-1 hover:text-foreground transition-colors"
                      onClick={() => handleSort('role')}
                    >
                      <span>Role</span>
                      {getSortIcon('role')}
                    </button>
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide w-32">
                    <button
                      className="flex items-center space-x-1 hover:text-foreground transition-colors"
                      onClick={() => handleSort('account_status')}
                    >
                      <span>Status</span>
                      {getSortIcon('account_status')}
                    </button>
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide w-24">
                    <button
                      className="flex items-center space-x-1 hover:text-foreground transition-colors"
                      onClick={() => handleSort('last_login')}
                    >
                      <span>Login</span>
                      {getSortIcon('last_login')}
                    </button>
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide w-32">
                    Reset
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide w-16">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                {paginatedAccounts.map((account: Account) => {
                  const currentStatus = account.account_status || (account.is_active ? 'ACTIVE' : 'INACTIVE');
                  return (
                    <tr key={account.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedAccounts.has(account.id)}
                            onChange={(e) => handleSelectAccount(account.id, e.target.checked)}
                            className="rounded border-gray-300"
                          />
                          <div className="flex items-center max-w-[300px]">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-blue-600 font-medium text-xs">
                                {account.first_name?.charAt(0)}{account.last_name?.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-2 min-w-0 flex-1">
                              <div className="flex items-center space-x-1">
                                {account.employee ? (
                                  <Link 
                                    href={`/admin/people/${account.employee.id}`}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline truncate"
                                  >
                                    {account.first_name} {account.last_name}
                                  </Link>
                                ) : (
                                  <div className="flex items-center space-x-1">
                                    <span className="text-sm font-medium text-gray-600 truncate">
                                      {account.first_name} {account.last_name}
                                    </span>
                                    <UserX className="w-3 h-3 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {account.email}
                              </div>
                              {account.employee && (
                                <div className="text-xs text-muted-foreground truncate mt-1">
                                  <span className="font-medium">{account.employee.position_title}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-foreground">
                        {getRoleBadge(account.role)}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-foreground">
                        {getStatusBadge(account)}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-foreground">
                        {account.last_login ? (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(account.last_login), { addSuffix: true })}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">Never</span>
                        )}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-foreground">
                        {account.password_reset_requested_at ? (
                          <div className="flex flex-col space-y-1">
                            <Badge variant="outline" className="text-xs w-fit">
                              {formatDistanceToNow(new Date(account.password_reset_requested_at), { addSuffix: true })}
                            </Badge>
                            {account.password_reset_completed_at && (
                              <Badge variant="secondary" className="text-xs w-fit">
                                ✓ Done
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-foreground">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handlePasswordReset(account)}>
                              <Key className="mr-2 h-4 w-4" />
                              Reset Password
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem 
                              disabled={!hasNewFields}
                              onClick={() => {
                                // TODO: Implement account events modal/dialog
                                toast({
                                  title: "Feature coming soon",
                                  description: "Account events viewer will be available soon.",
                                });
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Events
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem onClick={() => handleSuspendAccount(account)}>
                              {currentStatus === 'SUSPENDED' ? (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Activate Account
                                </>
                              ) : (
                                <>
                                  <UserX className="mr-2 h-4 w-4" />
                                  Suspend Account
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} accounts
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}