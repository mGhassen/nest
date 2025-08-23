import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Documents() {
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
    <div className="p-6" data-testid="documents-page">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900" data-testid="text-documents-title">
              Document Management
            </h1>
            <p className="text-gray-600" data-testid="text-documents-subtitle">
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
            <div className="text-2xl font-bold text-gray-900" data-testid="text-contracts-count">
              145
            </div>
            <div className="text-sm text-gray-600">Active Contracts</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <FileText className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <div className="text-2xl font-bold text-gray-900" data-testid="text-templates-count">
              12
            </div>
            <div className="text-sm text-gray-600">Document Templates</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <FileText className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <div className="text-2xl font-bold text-gray-900" data-testid="text-pending-signatures-count">
              8
            </div>
            <div className="text-sm text-gray-600">Pending Signatures</div>
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
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <FileText className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-medium text-gray-900" data-testid="text-document-employment-contract">
                    Employment Contract - Sarah Chen
                  </p>
                  <p className="text-sm text-gray-600">Created on Jan 15, 2024</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Signed
                </span>
                <Button variant="ghost" size="sm" data-testid="button-view-contract-sarah">
                  View
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <FileText className="w-8 h-8 text-amber-600" />
                <div>
                  <p className="font-medium text-gray-900" data-testid="text-document-nda">
                    Non-Disclosure Agreement - Alex Thompson
                  </p>
                  <p className="text-sm text-gray-600">Created on Jan 12, 2024</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Pending Signature
                </span>
                <Button variant="ghost" size="sm" data-testid="button-view-nda-alex">
                  View
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
