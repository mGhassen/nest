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
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowRight, ChevronRight, Globe, Shield, Zap, Users, Building2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
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
    <div className="min-h-screen flex bg-gradient-to-br from-background via-background to-muted/20">
      {/* Left side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Enhanced Background with Subtle Patterns */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/90 to-primary/85"></div>
        
        {/* Subtle geometric patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 border border-primary-foreground/20 rounded-full"></div>
          <div className="absolute top-40 right-32 w-24 h-24 border border-primary-foreground/20 rounded-full"></div>
          <div className="absolute bottom-32 left-32 w-20 h-20 border border-primary-foreground/20 rounded-full"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          {/* Top Header */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-foreground/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-primary-foreground/30">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-primary-foreground">Nest HR</span>
            </div>
            <Link 
              href="/auth/signup" 
              className="group bg-primary-foreground/15 backdrop-blur-sm text-primary-foreground px-4 py-2.5 rounded-xl font-medium hover:bg-primary-foreground/25 transition-all duration-300 inline-flex items-center gap-2 border border-primary-foreground/25 shadow-lg hover:shadow-xl"
            >
              <span>Sign up</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
          
          {/* Main Content */}
          <div className="text-center max-w-lg mx-auto">
            {/* Hero Icon */}
            <div className="mb-12">
              <div className="relative">
                <div className="w-28 h-28 bg-primary-foreground/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto shadow-2xl border border-primary-foreground/30">
                  <Building2 className="w-14 h-14 text-primary-foreground" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary-foreground/30 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
              </div>
            </div>
            
            {/* Text Content */}
            <div className="mb-10">
              <h1 className="text-5xl font-bold mb-4 text-primary-foreground leading-tight">
                Streamline Your HR Operations
              </h1>
              <div className="inline-block mb-6">
                <span className="text-lg font-semibold bg-primary-foreground/20 backdrop-blur-sm text-primary-foreground px-6 py-3 rounded-2xl border border-primary-foreground/30 shadow-lg">
                  Modern & Efficient
                </span>
              </div>
            </div>
            
            <p className="text-xl text-primary-foreground/90 mb-10 leading-relaxed">
              Manage employees, payroll, and compliance with our modern HR platform. 
              Built for growing companies that need enterprise-grade solutions.
            </p>
            
            {/* Feature highlights */}
            <div className="space-y-4 mb-10">
              <div className="flex items-center justify-center gap-4 text-primary-foreground/90">
                <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-lg">Employee lifecycle management</span>
              </div>
              <div className="flex items-center justify-center gap-4 text-primary-foreground/90">
                <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-lg">Compliance & security</span>
              </div>
              <div className="flex items-center justify-center gap-4 text-primary-foreground/90">
                <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-lg">Automated workflows</span>
              </div>
            </div>
          </div>
          
          {/* Learn More Button */}
          <div className="text-center">
            <button className="group bg-primary-foreground/15 backdrop-blur-sm border-2 border-primary-foreground/30 text-primary-foreground px-8 py-4 rounded-2xl font-medium hover:bg-primary-foreground/25 transition-all duration-300 flex items-center gap-3 mx-auto shadow-lg hover:shadow-xl hover:scale-105">
              Learn more
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-12 md:p-16">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-10 flex justify-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-2xl text-foreground">Nest HR</span>
            </div>
          </div>
          
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-foreground mb-3">Welcome back</h2>
            <p className="text-lg text-muted-foreground">Sign in to your account to continue</p>
          </div>
          
          {/* Login Options */}
          <div className="space-y-4 mb-8">
            {/* Google Button */}
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-3 h-14 border-2 border-border hover:border-primary hover:bg-primary/5 transition-all duration-300 font-medium rounded-2xl text-base shadow-sm hover:shadow-md"
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
          </div>
          
          {/* Divider */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-6 bg-background text-muted-foreground font-medium">or continue with email</span>
            </div>
          </div>
          
          {/* Email Form */}
          <form className="space-y-6" onSubmit={handleEmailSignIn}>
            {error && (
              <Alert className="border-destructive/20 bg-destructive/5 text-destructive">
                <AlertDescription className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2z" clipRule="evenodd" />
                  </svg>
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground">Email address</Label>
              <div className="relative">
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
                    "h-14 border-2 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-300 shadow-sm text-base pl-12",
                    focusedField === 'email' ? "border-primary" : "border-input"
                  )}
                  placeholder="Enter your email"
                />
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold text-foreground">Password</Label>
                <Link 
                  href="/auth/reset-password" 
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-300 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
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
                    "h-14 border-2 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-300 shadow-sm text-base pl-12 pr-12",
                    focusedField === 'password' ? "border-primary" : "border-input"
                  )}
                  placeholder="Enter your password"
                />
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  {isPasswordVisible ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            
            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-base" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>
          
          {/* Sign up link */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-primary hover:text-primary/80 font-semibold transition-colors duration-300 hover:underline">
                Sign up for free
              </Link>
            </p>
          </div>
          
          {/* Support Link */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              Having trouble?{' '}
              <Link href="#" className="text-primary hover:text-primary/80 font-medium transition-colors duration-300 hover:underline">Contact support</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
