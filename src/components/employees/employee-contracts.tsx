import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, Download } from "lucide-react";
import type { Contract } from "@/types/employee";

interface EmployeeContractsProps {
  contracts: Contract[];
  onCreateContract?: () => void;
  onViewContract?: (contractId: number) => void;
  onDownloadContract?: (contractId: number) => void;
}

export default function EmployeeContracts({ 
  contracts,
  onCreateContract,
  onViewContract,
  onDownloadContract
}: EmployeeContractsProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Contracts</CardTitle>
              <CardDescription>Manage employee contracts and agreements</CardDescription>
            </div>
            <Button size="sm" onClick={onCreateContract}>
              <FileText className="mr-2 h-4 w-4" />
              New Contract
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contracts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No contracts found</p>
                <p className="text-sm">Create a new contract to get started</p>
              </div>
            ) : (
              contracts.map((contract) => (
                <div key={contract.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{contract.type}</h4>
                      <p className="text-sm text-muted-foreground">
                        {contract.startDate} - {contract.endDate || 'Ongoing'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Signed: {contract.signedDate}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={contract.status === 'active' ? 'default' : 'secondary'}>
                        {contract.status}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onViewContract?.(contract.id)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onDownloadContract?.(contract.id)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
