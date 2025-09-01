import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, FileText, Download } from "lucide-react";
import type { PayrollRecord } from "@/types/employee";

interface EmployeePayrollProps {
  salary: number;
  payrollHistory: PayrollRecord[];
  onViewPayHistory?: () => void;
  onGeneratePayStub?: () => void;
  onDownloadTaxForms?: () => void;
  onUploadPayroll?: () => void;
}

export default function EmployeePayroll({ 
  salary,
  payrollHistory,
  onViewPayHistory,
  onGeneratePayStub,
  onDownloadTaxForms,
  onUploadPayroll
}: EmployeePayrollProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Payroll Information</CardTitle>
            <CardDescription>Current payroll settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Base Salary</span>
                <span className="text-sm">${salary.toLocaleString()}/year</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Pay Frequency</span>
                <span className="text-sm">Monthly</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Tax Status</span>
                <span className="text-sm">Single</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Last Payment</span>
                <span className="text-sm">Dec 1, 2024</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payroll Actions</CardTitle>
            <CardDescription>Manage payroll for this employee</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={onViewPayHistory}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                View Pay History
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={onGeneratePayStub}
              >
                <FileText className="mr-2 h-4 w-4" />
                Generate Pay Stub
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={onDownloadTaxForms}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Tax Forms
              </Button>
              <Button 
                className="w-full justify-start"
                onClick={onUploadPayroll}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Upload Payroll
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payroll History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payroll History</CardTitle>
          <CardDescription>Last 6 months of payroll records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {payrollHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No payroll history found</p>
                <p className="text-sm">Payroll records will appear here once processed</p>
              </div>
            ) : (
              payrollHistory.map((payroll, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{payroll.period}</p>
                    <p className="text-sm text-muted-foreground">Monthly Salary</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${payroll.amount.toLocaleString()}</p>
                    <Badge variant="default" className="text-xs">
                      {payroll.status}
                    </Badge>
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
