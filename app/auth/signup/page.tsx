'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Building2, Users, Shield, Zap, ArrowRight, Sparkles, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const router = useRouter()
  const { signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      await signUp(email, password)
      setSuccess(true)
      // Redirect to verify email page or show success message
      router.push('/auth/verify-email')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during sign up')
    } finally {
      setLoading(false)
    }
  }

  async function handleResendVerification() {
    try {
      setLoading(true)
      const { error } = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }).then((res) => res.json())

      if (error) throw error
      
      // Show success message
      alert('Verification email sent successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend verification email')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <div className="w-full max-w-md bg-background rounded-3xl shadow-2xl border border-border p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Verify Your Email</h2>
            <p className="text-muted-foreground leading-relaxed">
              We've sent a verification link to <span className="font-semibold text-foreground">{email}</span>. Please check your email and click the link to verify your account.
            </p>
          </div>
          <div className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              Didn't receive an email?{' '}
              <button
                onClick={() => handleResendVerification()}
                className="text-primary underline-offset-4 hover:underline font-medium"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Resend verification email'}
              </button>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-primary underline-offset-4 hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
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
              href="/auth/signin" 
              className="group bg-primary-foreground/15 backdrop-blur-sm text-primary-foreground px-4 py-2.5 rounded-xl font-medium hover:bg-primary-foreground/25 transition-all duration-300 inline-flex items-center gap-2 border border-primary-foreground/25 shadow-lg hover:shadow-xl"
            >
              <span>Sign in</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
          
          {/* Main Content */}
          <div className="max-w-lg">
            {/* Hero Icon */}
            <div className="mb-12">
              <div className="relative">
                <div className="w-28 h-28 bg-primary-foreground/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl border border-primary-foreground/30">
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
                Join Nest HR Platform
              </h1>
              <div className="inline-block mb-6">
                <span className="text-lg font-semibold bg-primary-foreground/20 backdrop-blur-sm text-primary-foreground px-6 py-3 rounded-2xl border border-primary-foreground/30 shadow-lg">
                  Start Your Journey
                </span>
              </div>
            </div>
            
            <p className="text-xl text-primary-foreground/90 mb-10 leading-relaxed">
              Create your account and start managing your HR operations with our modern platform. 
              Built for growing companies that need enterprise-grade solutions.
            </p>
            
            {/* Feature highlights */}
            <div className="space-y-4 mb-10">
              <div className="flex items-center gap-4 text-primary-foreground/90">
                <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-lg">Employee lifecycle management</span>
              </div>
              <div className="flex items-center gap-4 text-primary-foreground/90">
                <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-lg">Compliance & security</span>
              </div>
              <div className="flex items-center gap-4 text-primary-foreground/90">
                <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-lg">Automated workflows</span>
              </div>
            </div>
          </div>
          
          {/* Get Started Button */}
          <div>
            <button className="group bg-primary-foreground/15 backdrop-blur-sm border-2 border-primary-foreground/30 text-primary-foreground px-8 py-4 rounded-2xl font-medium hover:bg-primary-foreground/25 transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl hover:scale-105">
              Get started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Right side - Signup Form */}
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
            <h2 className="text-4xl font-bold text-foreground mb-3">Create an account</h2>
            <p className="text-lg text-muted-foreground">
              Enter your information to get started
            </p>
          </div>
          
          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
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
              <Label htmlFor="password" className="text-sm font-semibold text-foreground">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={isPasswordVisible ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className={cn(
                    "h-14 border-2 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-300 shadow-sm text-base pl-12 pr-12",
                    focusedField === 'password' ? "border-primary" : "border-input"
                  )}
                  placeholder="Create a password"
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
            
            <div className="space-y-3">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">Confirm password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={isConfirmPasswordVisible ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  className={cn(
                    "h-14 border-2 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-300 shadow-sm text-base pl-12 pr-12",
                    focusedField === 'confirmPassword' ? "border-primary" : "border-input"
                  )}
                  placeholder="Confirm your password"
                />
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <button
                  type="button"
                  onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  {isConfirmPasswordVisible ? (
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
              className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-base" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>
          
          {/* Terms and Sign In Link */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p className="mb-4 leading-relaxed">
              By creating an account, you agree to our{' '}
              <Link href="#" className="text-primary hover:text-primary/80 font-medium transition-colors duration-300 hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link href="#" className="text-primary hover:text-primary/80 font-medium transition-colors duration-300 hover:underline">Privacy Policy</Link>
            </p>
            <p>
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-primary hover:text-primary/80 font-medium transition-colors duration-300 hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
