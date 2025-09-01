"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, FileText, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AuthGuard from "@/components/auth/auth-guard";
import AdminLayout from "@/components/layout/admin-layout";

export default function PayrollPage() {
  const { toast } = useToast();

  const handleCalculatePayroll = () => {
    toast({
      title: "Payroll Calculation",
      description: "Payroll calculation has been started",
    });
  };

  const handleGeneratePayslips = () => {
    toast({
      title: "Payslip Generation",
      description: "PDF payslips are being generated",
    });
  };

  const handleExportBank = () => {
    toast({
      title: "Bank Export",
      description: "Bank transfer CSV is being generated",
    });
  };

  return (
    <AuthGuard requireAdmin={true}>
      <AdminLayout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2" data-testid="text-payroll-title">
              Payroll Management
            </h1>
            <p className="text-muted-foreground" data-testid="text-payroll-subtitle">
              Manage payroll cycles, generate payslips, and export payment files
            </p>
          </div>

          {/* Current Cycle Status */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center" data-testid="text-current-cycle-title">
                <DollarSign className="w-5 h-5 mr-2" />
                Current Payroll Cycle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium" data-testid="text-cycle-period">
                    January 2024
                  </p>
                  <p className="text-sm text-muted-foreground" data-testid="text-cycle-status">
                    Status: Ready for Processing
                  </p>
                  <p className="text-sm text-muted-foreground" data-testid="text-employee-count">
                    247 employees eligible
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Button onClick={handleCalculatePayroll} data-testid="button-calculate-payroll">
                    Calculate Payroll
                  </Button>
                  <Button variant="outline" onClick={handleGeneratePayslips} data-testid="button-generate-payslips">
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Payslips
                  </Button>
                  <Button variant="outline" onClick={handleExportBank} data-testid="button-export-bank">
                    <Download className="w-4 h-4 mr-2" />
                    Export Bank File
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payroll Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-foreground" data-testid="text-gross-total">
                  €1,247,500
                </div>
                <div className="text-sm text-muted-foreground">Total Gross</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-foreground" data-testid="text-net-total">
                  €952,400
                </div>
                <div className="text-sm text-muted-foreground">Total Net</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-foreground" data-testid="text-tax-total">
                  €295,100
                </div>
                <div className="text-sm text-muted-foreground">Total Tax</div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Payroll Cycles */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Payroll Cycles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">December 2023</p>
                    <p className="text-sm text-muted-foreground">Completed on Dec 28, 2023</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Completed
                    </span>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">November 2023</p>
                    <p className="text-sm text-muted-foreground">Completed on Nov 30, 2023</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Completed
                    </span>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">October 2023</p>
                    <p className="text-sm text-muted-foreground">Completed on Oct 31, 2023</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Completed
                    </span>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}

