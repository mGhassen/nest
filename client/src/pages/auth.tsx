import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Shield, 
  User, 
  Eye, 
  EyeOff, 
  Building,
  ArrowRight,
  Lock,
  Mail
} from "lucide-react";

const employeeLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type EmployeeLoginData = z.infer<typeof employeeLoginSchema>;

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  const form = useForm<EmployeeLoginData>({
    resolver: zodResolver(employeeLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const employeeLoginMutation = useMutation({
    mutationFn: async (data: EmployeeLoginData) => {
      return await apiRequest("POST", "/api/auth/employee-login", data);
    },
    onSuccess: () => {
      toast({
        title: "Login Successful",
        description: "Welcome to your employee portal!",
      });
      // Redirect will be handled by the auth system
      window.location.href = "/";
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed", 
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    },
  });

  const handleEmployeeLogin = (data: EmployeeLoginData) => {
    employeeLoginMutation.mutate(data);
  };

  const handleReplacitLogin = () => {
    window.location.href = "/api/login";
  };

  // Redirect if already authenticated
  if (isAuthenticated) {
    window.location.href = "/";
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-lg bg-gray-200 dark:bg-gray-700 h-12 w-12"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4" data-testid="auth-page">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="title-login">
              Welcome to PayfitLite
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Choose your login method to access the HR system
            </p>
          </div>
        </div>

        {/* Login Options */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="admin" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="admin" data-testid="tab-admin" className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Admin / Manager</span>
                </TabsTrigger>
                <TabsTrigger value="employee" data-testid="tab-employee" className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Employee</span>
                </TabsTrigger>
              </TabsList>

              {/* Admin/Manager Login */}
              <TabsContent value="admin" className="space-y-4">
                <Alert>
                  <Building className="h-4 w-4" />
                  <AlertDescription>
                    Administrators and managers use Replit authentication to access the full HR management system.
                  </AlertDescription>
                </Alert>
                
                <Button 
                  onClick={handleReplacitLogin}
                  className="w-full h-12 text-lg"
                  data-testid="button-admin-login"
                >
                  <Shield className="mr-2 h-5 w-5" />
                  Sign in as Admin/Manager
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This will redirect you to secure Replit authentication
                  </p>
                </div>
              </TabsContent>

              {/* Employee Login */}
              <TabsContent value="employee" className="space-y-4">
                <Alert>
                  <User className="h-4 w-4" />
                  <AlertDescription>
                    Employees use their company email and password to access their personal portal.
                  </AlertDescription>
                </Alert>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleEmployeeLogin)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                {...field}
                                type="email"
                                placeholder="your.email@company.com"
                                className="pl-10"
                                data-testid="input-employee-email"
                                autoComplete="email"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                {...field}
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                className="pl-10 pr-10"
                                data-testid="input-employee-password"
                                autoComplete="current-password"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                                data-testid="button-toggle-password-visibility"
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full h-12 text-lg"
                      disabled={employeeLoginMutation.isPending}
                      data-testid="button-employee-login"
                    >
                      {employeeLoginMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Signing in...
                        </>
                      ) : (
                        <>
                          <User className="mr-2 h-5 w-5" />
                          Sign in as Employee
                        </>
                      )}
                    </Button>
                  </form>
                </Form>

                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Don't have access? Contact your HR administrator.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            PayfitLite HR Management System
          </p>
        </div>
      </div>
    </div>
  );
}