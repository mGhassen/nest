import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import AuthPage from "@/pages/auth";
import Setup from "@/pages/setup";
import Dashboard from "@/pages/dashboard";
import Employees from "@/pages/employees";
import Timesheets from "@/pages/timesheets";
import Leave from "@/pages/leave";
import TeamCalendar from "@/pages/team-calendar";
import Payroll from "@/pages/payroll";
import Documents from "@/pages/documents";
import Settings from "@/pages/settings";
import EmployeeDetail from "@/pages/employees/employee-detail";
import EmployeePortal from "@/pages/employee-portal";
import DeelLayout from "@/components/layout/deel-layout";

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading during authentication check
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show landing page for unauthenticated users
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/auth" component={AuthPage} />
        <Route component={NotFound} />
      </Switch>
    );
  }



  // Show setup page if admin user doesn't have a company
  if (!user?.companyId) {
    return (
      <Switch>
        <Route path="/" component={Setup} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Show main application for users with admin/management roles
  return (
    <Switch>
      <DeelLayout>
        <Route path="/" component={Dashboard} />
        <Route path="/employees/:id" component={EmployeeDetail} />
        <Route path="/employees" component={Employees} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/timesheets" component={Timesheets} />
        <Route path="/leave" component={Leave} />
        <Route path="/team-calendar" component={TeamCalendar} />
        <Route path="/payroll" component={Payroll} />
        <Route path="/documents" component={Documents} />
        <Route path="/settings" component={Settings} />
      </DeelLayout>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
