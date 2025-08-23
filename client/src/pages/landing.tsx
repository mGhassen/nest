import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Clock, Calendar, DollarSign } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">PayfitLite</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive HR management system for modern businesses. 
            Manage employees, timesheets, leave requests, and payroll all in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="text-center" data-testid="feature-employees">
            <CardContent className="p-6">
              <Users className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Employee Management</h3>
              <p className="text-gray-600 text-sm">
                Complete employee lifecycle management with profiles, documents, and organizational structure.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center" data-testid="feature-timesheets">
            <CardContent className="p-6">
              <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Timesheet Tracking</h3>
              <p className="text-gray-600 text-sm">
                Weekly timesheet submission and approval workflow with overtime calculations.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center" data-testid="feature-leave">
            <CardContent className="p-6">
              <Calendar className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Leave Management</h3>
              <p className="text-gray-600 text-sm">
                Leave policies, balance tracking, request approvals, and team calendar views.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center" data-testid="feature-payroll">
            <CardContent className="p-6">
              <DollarSign className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Payroll Processing</h3>
              <p className="text-gray-600 text-sm">
                Automated payroll cycles with PDF payslips and comprehensive reporting.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button 
            onClick={() => window.location.href = '/auth'} 
            className="px-8 py-3 text-lg font-medium"
            data-testid="button-login"
          >
            Get Started
          </Button>
          <p className="text-gray-500 text-sm mt-4">
            Sign in with your account to access your HR dashboard
          </p>
        </div>
      </div>
    </div>
  );
}
