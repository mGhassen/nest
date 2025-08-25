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
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowRight, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
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

  // Test component to verify Tailwind CSS
  const TestTailwind = () => (
    <div className="p-4 mb-6 bg-green-100 border border-green-400 text-green-700 rounded-lg">
      <p className="font-bold">Tailwind CSS Test</p>
      <p>If you see this green box, Tailwind is working!</p>
      <div className="mt-2 p-2 bg-white rounded">
        <p className="text-blue-600 font-medium">Text with blue color</p>
        <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Test Button
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      <TestTailwind />
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 md:p-16 lg:p-24 max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Nest HR
            </span>
          </Link>
        </div>

        <div className="space-y-1 mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-primary-foreground/80">
          <span> 2023 Nest HR</span>
          <span>•</span>
          <a href="#" className="hover:underline">Privacy</a>
          <span>•</span>
          <a href="#" className="hover:underline">Terms</a>
        </div>
      </div>
      
      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-12 md:p-16">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="lg:hidden mb-8 flex justify-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <span className="font-bold text-xl text-foreground">Nest HR</span>
            </div>
          </div>
          
          <div className="space-y-1 mb-8">
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="font-medium text-primary hover:text-primary/90 transition-colors">
                Sign up
              </Link>
            </p>
          </div>
          
          <Card className="border-none shadow-none">
            <CardContent className="p-0">
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 mb-6 border-border/50 hover:bg-muted/50 transition-colors"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </Button>
              
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background text-muted-foreground">Or continue with email</span>
                </div>
              </div>
              
              <form className="space-y-4" onSubmit={handleEmailSignIn}>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11"
                      placeholder="name@company.com"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
                    <Link 
                      href="/auth/forgot-password" 
                      className="text-sm font-medium text-primary hover:text-primary/90 transition-colors"
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                    >
                      Forgot password?
                      <ChevronRight 
                        className={cn(
                          "inline-block h-4 w-4 transition-transform duration-200",
                          isHovered ? "translate-x-0.5" : ""
                        )} 
                      />
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type={isPasswordVisible ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-11"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    >
                      {isPasswordVisible ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-11 mt-6 font-medium" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <div className="mt-8 text-center text-sm text-muted-foreground lg:hidden">
            <p>© 2023 Nest HR. All rights reserved.</p>
            <p className="mt-2 text-xs text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
