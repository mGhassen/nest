"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Loader2, CheckCircle, Moon, Sun } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/theme-provider";
import { useRouter } from "next/navigation";

export default function LoginClient({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const { toast } = useToast();
  const { login, authError, isLoggingIn, user, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // Check for success messages from searchParams
    const messageRaw = searchParams.message;
    const message = Array.isArray(messageRaw) ? messageRaw[0] : messageRaw;
    if (message === 'password-set-success') {
      setSuccess('Your password has been set successfully! You can now log in with your new password.');
    } else if (message === 'password-reset-success') {
      setSuccess('Your password has been reset successfully! You can now log in with your new password.');
    }
  }, [searchParams]);

  // Handle redirect after successful login
  useEffect(() => {
    console.log('Login useEffect triggered:', { user, isLoading });
    if (!isLoading && user) {
      console.log('User logged in, redirecting to dashboard...', user);
      if (user.isAdmin) {
        console.log('Redirecting to admin dashboard');
        router.replace("/admin/dashboard");
      } else {
        console.log('Redirecting to employee dashboard');
        router.replace("/employee/dashboard");
      }
    }
  }, [user, isLoading, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      console.log('Starting login process...');
      await login(email, password);
      console.log('Login function completed successfully');
      // Redirect will be handled by useEffect
    } catch (err: unknown) {
      console.error('Login error:', err);
      let errorMessage = 'An error occurred during login';
      if (err instanceof Error) {
        if (err.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password';
        } else if (err.message.includes('Email not confirmed')) {
          errorMessage = 'Please verify your email before logging in';
        } else {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      toast({
        title: "Google Login",
        description: "Google login is not yet available. Please use email and password.",
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to sign in with Google");
      } else {
        setError("Failed to sign in with Google");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 relative">
      {/* Theme Toggle */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 h-9 w-9"
        data-testid="button-theme-toggle"
      >
        {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </Button>
      
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Welcome to Nest
          </CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Show global auth error if present */}
          {authError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}
          {error && !authError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert variant="default">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Google Login */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email Login Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoggingIn}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoggingIn}
              />
              <div className="text-right">
                <Button
                  type="button"
                  variant="link"
                  className="text-xs p-0 h-auto"
                  onClick={() => {/* TODO: Implement forgot password */}}
                >
                  Forgot password?
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoggingIn}>
              {isLoggingIn && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Sign In
            </Button>
          </form>

          {/* Test Credentials */}
          <div className="text-center space-y-2">
            <p className="text-xs text-gray-500">Test Credentials:</p>
            <div className="flex flex-col space-y-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEmail("admin@guepard.run");
                  setPassword("admin123");
                }}
                className="text-xs"
              >
                Admin Login
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEmail("employee@guepard.run");
                  setPassword("employee123");
                }}
                className="text-xs"
              >
                Employee Login
              </Button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Need to create an account?{" "}
              <Button
                variant="link"
                className="text-sm p-0 h-auto"
                onClick={() => {/* TODO: Implement signup */}}
              >
                Sign up
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 