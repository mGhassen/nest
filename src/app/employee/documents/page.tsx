"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AuthGuard from "@/components/auth/auth-guard";
import EmployeeLayout from "@/components/layout/employee-layout";

export default function DocumentsPage() {
  const { toast } = useToast();

  const handleUploadDocument = () => {
    toast({
      title: "Upload Document",
      description: "Document upload dialog would open here",
    });
  };

  const handleNewTemplate = () => {
    toast({
      title: "New Template",
      description: "Contract template creation would open here",
    });
  };

  return (
    <AuthGuard requireEmployee={true}>
      <EmployeeLayout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground" data-testid="text-documents-title">
                  Document Management
                </h1>
                <p className="text-muted-foreground" data-testid="text-documents-subtitle">
                  Manage contracts, templates, and employee documents
                </p>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={handleUploadDocument} data-testid="button-upload-document">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
                <Button onClick={handleNewTemplate} data-testid="button-new-template">
                  <Plus className="w-4 h-4 mr-2" />
                  New Template
                </Button>
              </div>
            </div>
          </div>

          {/* Document Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardContent className="p-6 text-center">
                <FileText className="w-12 h-12 text-primary mx-auto mb-4" />
                <div className="text-2xl font-bold text-foreground" data-testid="text-contracts-count">
                  145
                </div>
                <div className="text-sm text-muted-foreground">Active Contracts</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <FileText className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <div className="text-2xl font-bold text-foreground" data-testid="text-templates-count">
                  12
                </div>
                <div className="text-sm text-muted-foreground">Document Templates</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <FileText className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <div className="text-2xl font-bold text-foreground" data-testid="text-pending-signatures-count">
                  8
                </div>
                <div className="text-sm text-muted-foreground">Pending Signatures</div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Documents */}
          <Card>
            <CardHeader>
              <CardTitle data-testid="text-recent-documents-title">Recent Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <FileText className="w-8 h-8 text-primary" />
                    <div>
                      <p className="font-medium text-foreground" data-testid="text-document-employment-contract">
                        Employment Contract - Sarah Chen
                      </p>
                      <p className="text-sm text-muted-foreground">Created on Jan 15, 2024</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Signed
                    </span>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <FileText className="w-8 h-8 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">
                        Non-Disclosure Agreement - Mark Rodriguez
                      </p>
                      <p className="text-sm text-muted-foreground">Created on Jan 12, 2024</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <FileText className="w-8 h-8 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">
                        Employee Handbook v2.1
                      </p>
                      <p className="text-sm text-muted-foreground">Updated on Jan 10, 2024</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Published
                    </span>
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </EmployeeLayout>
    </AuthGuard>
  );
}
