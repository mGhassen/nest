import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { hasPermission } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Upload, Plus, Download, Eye, Edit2, Search, Filter } from "lucide-react";
import { format } from "date-fns";

export default function DocumentsIndex() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Get the first company membership
  const membership = user.memberships?.[0];
  const companyId = membership?.companyId;

  if (!companyId) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Company Access</h2>
          <p className="text-gray-600">You don't have access to any company. Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  // Check permissions
  const canViewDocuments = hasPermission(membership, "document:read");
  const canCreateDocuments = hasPermission(membership, "document:create");
  const canUpdateDocuments = hasPermission(membership, "document:update");
  const isAdmin = ["OWNER", "ADMIN", "HR"].includes(membership.role);

  if (!canViewDocuments) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view documents.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="documents-index">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
            <p className="text-gray-600">Manage contracts, templates, and employee documents</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" data-testid="button-upload-document">
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
            {canCreateDocuments && (
              <Button data-testid="button-create-template">
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <DocumentStats companyId={companyId} />

        {/* Tabs */}
        <Tabs defaultValue="contracts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="contracts">Employee Contracts</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="uploads">Uploaded Documents</TabsTrigger>
            {isAdmin && <TabsTrigger value="settings">Document Settings</TabsTrigger>}
          </TabsList>

          {/* Employee Contracts */}
          <TabsContent value="contracts">
            <EmployeeContracts companyId={companyId} />
          </TabsContent>

          {/* Templates */}
          <TabsContent value="templates">
            <DocumentTemplates companyId={companyId} />
          </TabsContent>

          {/* Uploaded Documents */}
          <TabsContent value="uploads">
            <UploadedDocuments companyId={companyId} />
          </TabsContent>

          {/* Document Settings */}
          {isAdmin && (
            <TabsContent value="settings">
              <DocumentSettings companyId={companyId} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

function DocumentStats({ companyId }: { companyId: string }) {
  // Mock stats - in a real app, these would come from API endpoints
  const stats = {
    totalContracts: 247,
    pendingSigning: 3,
    templates: 12,
    uploadedDocuments: 89,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Contracts</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalContracts}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Signing</p>
              <p className="text-3xl font-bold text-amber-600">{stats.pendingSigning}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
              <Edit2 className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Templates</p>
              <p className="text-3xl font-bold text-green-600">{stats.templates}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <Plus className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Uploaded Documents</p>
              <p className="text-3xl font-bold text-purple-600">{stats.uploadedDocuments}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EmployeeContracts({ companyId }: { companyId: string }) {
  // Mock data - in a real app, this would come from API
  const contracts = [
    {
      id: "1",
      employeeId: "emp1",
      employeeName: "Sarah Chen",
      title: "Employment Contract",
      version: 1,
      signedAt: new Date("2024-01-15"),
      status: "Signed",
    },
    {
      id: "2",
      employeeId: "emp2",
      employeeName: "Mark Rodriguez",
      title: "Employment Contract",
      version: 1,
      signedAt: null,
      status: "Pending Signature",
    },
    {
      id: "3",
      employeeId: "emp3",
      employeeName: "Alex Thompson",
      title: "NDA Agreement",
      version: 2,
      signedAt: new Date("2024-01-10"),
      status: "Signed",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Employee Contracts</CardTitle>
            <CardDescription>Manage employment contracts and agreements</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search contracts..."
                className="pl-10 w-64"
                data-testid="input-search-contracts"
              />
            </div>
            <Button variant="outline" size="sm" data-testid="button-filter-contracts">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Contract Type</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Signed Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map((contract) => (
              <TableRow key={contract.id} data-testid={`contract-row-${contract.id}`}>
                <TableCell>
                  <div className="font-medium">{contract.employeeName}</div>
                  <div className="text-sm text-gray-500">ID: {contract.employeeId}</div>
                </TableCell>
                <TableCell>{contract.title}</TableCell>
                <TableCell>v{contract.version}</TableCell>
                <TableCell>
                  <Badge
                    variant={contract.status === "Signed" ? "default" : "secondary"}
                    className={contract.status === "Signed" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}
                  >
                    {contract.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {contract.signedAt ? format(contract.signedAt, "MMM dd, yyyy") : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="sm" data-testid={`button-view-contract-${contract.id}`}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" data-testid={`button-download-contract-${contract.id}`}>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" data-testid={`button-edit-contract-${contract.id}`}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function DocumentTemplates({ companyId }: { companyId: string }) {
  // Mock data - in a real app, this would come from API
  const templates = [
    {
      id: "1",
      name: "Standard Employment Contract",
      description: "Default employment contract template",
      variables: ["employeeName", "position", "salary", "startDate"],
      createdAt: new Date("2024-01-01"),
      lastUsed: new Date("2024-01-15"),
    },
    {
      id: "2",
      name: "NDA Agreement",
      description: "Non-disclosure agreement template",
      variables: ["employeeName", "companyName"],
      createdAt: new Date("2024-01-01"),
      lastUsed: new Date("2024-01-10"),
    },
    {
      id: "3",
      name: "Contractor Agreement",
      description: "Independent contractor agreement",
      variables: ["contractorName", "projectDescription", "rate"],
      createdAt: new Date("2024-01-01"),
      lastUsed: null,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Document Templates</CardTitle>
            <CardDescription>Create and manage reusable document templates</CardDescription>
          </div>
          <Button data-testid="button-create-new-template">
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow" data-testid={`template-card-${template.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="mt-2">{template.description}</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" data-testid={`button-template-menu-${template.id}`}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Variables:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {template.variables.map((variable) => (
                        <Badge key={variable} variant="outline" className="text-xs">
                          {`{{${variable}}}`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                    <p className="text-xs text-gray-500">
                      Created: {format(template.createdAt, "MMM dd, yyyy")}
                    </p>
                    {template.lastUsed && (
                      <p className="text-xs text-gray-500">
                        Last used: {format(template.lastUsed, "MMM dd, yyyy")}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2 pt-2">
                    <Button size="sm" className="flex-1" data-testid={`button-use-template-${template.id}`}>
                      Use Template
                    </Button>
                    <Button size="sm" variant="outline" data-testid={`button-edit-template-${template.id}`}>
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function UploadedDocuments({ companyId }: { companyId: string }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Uploaded Documents</CardTitle>
            <CardDescription>Manage uploaded files and attachments</CardDescription>
          </div>
          <Button data-testid="button-upload-new-document">
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Uploaded</h3>
          <p className="text-gray-600 mb-4">
            Upload documents to store and organize important files.
          </p>
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Upload Your First Document
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function DocumentSettings({ companyId }: { companyId: string }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>E-Signature Settings</CardTitle>
          <CardDescription>Configure electronic signature preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-900">Default Signature Provider</label>
              <p className="text-sm text-gray-600 mt-1">Choose your preferred e-signature service</p>
              <div className="mt-2">
                <Badge variant="outline">Internal Signature Capture</Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900">Signature Requirements</label>
              <p className="text-sm text-gray-600 mt-1">Set requirements for document signing</p>
              <div className="mt-2 space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                  <span className="ml-2 text-sm">Require timestamp verification</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                  <span className="ml-2 text-sm">Require IP address logging</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="ml-2 text-sm">Require identity verification</span>
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Document Storage</CardTitle>
          <CardDescription>Manage document storage and retention policies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-900">Storage Location</label>
              <p className="text-sm text-gray-600 mt-1">Where documents are stored</p>
              <div className="mt-2">
                <Badge variant="outline">Internal Storage</Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900">Retention Policy</label>
              <p className="text-sm text-gray-600 mt-1">How long documents are kept</p>
              <div className="mt-2">
                <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                  <option>Keep indefinitely</option>
                  <option>7 years after termination</option>
                  <option>10 years after termination</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
