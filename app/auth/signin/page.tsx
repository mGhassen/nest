"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/useSupabaseAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowRight, ChevronRight, Globe, Shield, Zap, Users, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn, signInWithGoogle } = useAuth()
  
  const redirectedFrom = searchParams.get('redirectedFrom') || '/dashboard'

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }
    
    setLoading(true)
    setError("")

    try {
      await signIn(email, password)
      router.push(redirectedFrom)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError("")

    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during Google sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-background via-muted to-accent">
      {/* Left side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12 bg-gradient-to-br from-primary via-primary to-ring text-primary-foreground relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary-foreground rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-lg">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary-foreground/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold">Nest HR</span>
            </div>
          </div>

          <h1 className="text-4xl font-bold leading-tight mb-6">
            Streamline Your HR Operations
          </h1>
          
          <p className="text-primary-foreground/80 text-lg leading-relaxed mb-8">
            Manage employees, payroll, and compliance with our modern HR platform. 
            Built for growing companies that need enterprise-grade solutions.
          </p>

          {/* Feature highlights */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-primary-foreground/90">Employee lifecycle management</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-primary-foreground/90">Compliance & security</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-primary-foreground/90">Automated workflows</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-12 md:p-16">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-ring rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">Nest HR</span>
            </div>
          </div>
          
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Welcome back</h2>
            <p className="text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                Sign up for free
              </Link>
            </p>
          </div>
          
          {/* Form Card */}
          <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
            <CardContent className="p-8">
              {error && (
                <Alert variant="destructive" className="mb-6 border-destructive/20 bg-destructive/10">
                  <AlertDescription className="flex items-center text-destructive">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Google Sign In */}
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-3 mb-6 h-12 border-border hover:border-input hover:bg-muted transition-all duration-200 font-medium"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </Button>
              
              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-card text-muted-foreground font-medium">or continue with email</span>
                </div>
              </div>
              
              {/* Email Form */}
              <form className="space-y-5" onSubmit={handleEmailSignIn}>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-foreground">Email address</Label>
                  <div className="relative group">
                    <div className={cn(
                      "absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200",
                      focusedField === 'email' ? "text-primary" : "text-muted-foreground"
                    )}>
                      <Mail className="h-5 w-5" />
                    </div>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      className={cn(
                        "pl-12 h-12 border-2 transition-all duration-200 focus:ring-2 focus:ring-primary/20",
                        focusedField === 'email' ? "border-primary" : "border-input hover:border-ring"
                      )}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-semibold text-foreground">Password</Label>
                    <Link 
                      href="/auth/forgot-password" 
                      className="text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                    >
                      Forgot password?
                      <ChevronRight 
                        className={cn(
                          "inline-block h-4 w-4 transition-transform duration-200 ml-1",
                          isHovered ? "translate-x-0.5" : ""
                        )} 
                      />
                    </Link>
                  </div>
                  <div className="relative group">
                    <div className={cn(
                      "absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200",
                      focusedField === 'password' ? "text-primary" : "text-muted-foreground"
                    )}>
                      <Lock className="h-5 w-5" />
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type={isPasswordVisible ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      className={cn(
                        "pl-12 pr-12 h-12 border-2 transition-all duration-200 focus:ring-2 focus:ring-primary/20",
                        focusedField === 'password' ? "border-primary" : "border-input hover:border-ring"
                      )}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    >
                      {isPasswordVisible ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full h-12 mt-6 font-semibold text-base bg-gradient-to-r from-primary to-ring hover:from-primary/90 hover:to-ring/90 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in to your account <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {/* Footer */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>By continuing, you agree to our{' '}
              <Link href="#" className="text-primary hover:text-primary/80 font-medium">Terms of Service</Link>
              {' '}and{' '}
              <Link href="#" className="text-primary hover:text-primary/80 font-medium">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
