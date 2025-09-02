"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, User, Mail, Shield, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAccountsList } from "@/hooks/use-accounts";

interface LinkAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLink: (accountId: string) => void;
  employee: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export default function LinkAccountDialog({ 
  open, 
  onOpenChange, 
  onLink, 
  employee 
}: LinkAccountDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAccounts, setFilteredAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  
  // Use the accounts hook instead of direct API call
  const { data: accounts = [], isLoading, error } = useAccountsList();

  // Filter accounts based on search query
  useEffect(() => {
    // Filter out accounts that are already linked to employees
    const availableAccounts = accounts.filter(account => !account.employee);
    
    if (!searchQuery.trim()) {
      setFilteredAccounts(availableAccounts);
      return;
    }

    const filtered = availableAccounts.filter(account => 
      account.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${account.first_name} ${account.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredAccounts(filtered);
  }, [searchQuery, accounts]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // The filtering is already handled by useEffect, but we can add additional logic here if needed
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate search delay
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectAccount = (account: any) => {
    setSelectedAccount(account);
  };

  const handleLink = () => {
    if (selectedAccount) {
      onLink(selectedAccount.id);
      onOpenChange(false);
    }
  };

  const getRoleBadge = (role: string) => {
    return (
      <Badge variant={role === 'ADMIN' ? 'default' : 'secondary'}>
        {role}
      </Badge>
    );
  };

  const getStatusBadge = (account: any) => {
    const status = account.is_active ? 'ACTIVE' : 'INACTIVE';
    const color = account.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
    const Icon = account.is_active ? CheckCircle : AlertCircle;
    
    return (
      <Badge className={color}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Link Employee to Existing Account</span>
          </DialogTitle>
          <DialogDescription>
            Link {employee.first_name} {employee.last_name} ({employee.email}) to an existing user account.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Search Section */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Accounts</Label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={isSearching || !searchQuery.trim()}
                variant="outline"
              >
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>
          </div>

          {/* Accounts List */}
          <div className="flex-1 overflow-auto border rounded-md">
            {error ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-red-600 mb-2">Failed to load accounts</p>
                  <p className="text-xs text-muted-foreground">{error.message || 'Unknown error'}</p>
                </div>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading accounts...</p>
                </div>
              </div>
            ) : filteredAccounts.length === 0 ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? "No accounts found matching your search." : "No available accounts found."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredAccounts.map((account) => (
                  <div
                    key={account.id}
                    className={`p-3 rounded-md border cursor-pointer transition-colors ${
                      selectedAccount?.id === account.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => handleSelectAccount(account)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium">
                            {account.first_name} {account.last_name}
                          </span>
                          {getRoleBadge(account.role)}
                          {getStatusBadge(account)}
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span>{account.email}</span>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div>ID: {account.id}</div>
                        <div>Created: {new Date(account.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Account Info */}
          {selectedAccount && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Selected Account:</strong> {selectedAccount.first_name} {selectedAccount.last_name} ({selectedAccount.email})
                <br />
                <span className="text-sm text-muted-foreground">
                  This will link the employee to this existing account. The employee will be able to access the system using this account's credentials.
                </span>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleLink} 
            disabled={!selectedAccount}
            className="flex items-center space-x-2"
          >
            <User className="h-4 w-4" />
            <span>Link Account</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
