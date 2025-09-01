import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, Users } from "lucide-react";
import Link from "next/link";
import type { Account } from "@/types/schema";

interface AccountTableProps {
  accounts: Account[];
  onEdit: (account: Account) => void;
  onDelete: (id: string) => void;
}

export default function AccountTable({ accounts, onEdit, onDelete }: AccountTableProps) {
  const getInitials = (firstName: string | null, lastName: string | null) => {
    if (!firstName || !lastName) return '??';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRoleBadge = (role: string) => {
    const roleColors = {
      'OWNER': 'bg-red-100 text-red-800',
      'HR': 'bg-blue-100 text-blue-800',
      'MANAGER': 'bg-green-100 text-green-800',
      'EMPLOYEE': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}>
        {role}
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    }
    return <Badge variant="secondary">Inactive</Badge>;
  };

  if (accounts.length === 0) {
    return (
      <div className="rounded-xl border">
        <div className="p-8 text-center">
          <div className="text-muted-foreground mb-4">
            <Users className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No accounts found</h3>
          <p className="text-muted-foreground">Get started by adding your first employee account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg" data-testid="account-table">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Account
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Role
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Last Login
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-background divide-y divide-border">
            {accounts.map((account) => (
              <tr key={account.id} className="hover:bg-gray-50" data-testid={`account-row-${account.id}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm" data-testid={`text-account-initials-${account.id}`}>
                        {getInitials(account.first_name, account.last_name)}
                      </span>
                    </div>
                    <div className="ml-3">
                      <Link href={`/admin/people/${account.id}`} className="hover:underline">
                        <div className="text-sm font-medium text-blue-600" data-testid={`text-account-name-${account.id}`}>
                          {account.first_name} {account.last_name}
                        </div>
                      </Link>
                      <div className="text-xs text-muted-foreground" data-testid={`text-account-email-${account.id}`}>
                        {account.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {account.role || 'Employee'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {account.is_active ? 'Active' : 'Inactive'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {account.last_login ? new Date(account.last_login).toLocaleDateString() : 'Never'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {new Date(account.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(account)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(account.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
