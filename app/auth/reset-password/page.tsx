'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Building2, Users, Shield, Zap } from 'lucide-react'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const searchParams = useSearchParams()
  const { resetPassword } = useAuth()
  const token = searchParams.get('token')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (token) {
      // Complete password reset
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return
      }

      setLoading(true)
      setError('')
      
      try {
        const { error } = await resetPassword({ token, newPassword: password })
        if (error) throw error
        setSuccess(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to reset password')
      } finally {
        setLoading(false)
      }
    } else {
      // Request password reset
      if (!email) {
        setError('Email is required')
        return
      }

      setLoading(true)
      setError('')
      
      try {
        const { error } = await resetPassword({ email })
        if (error) throw error
        setSuccess(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send reset email')
      } finally {
        setLoading(false)
      }
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted p-4">
        <div className="w-full max-w-md bg-background rounded-2xl shadow-xl border border-border p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {token ? 'Password Reset Successful' : 'Check Your Email'}
            </h2>
            <p className="text-muted-foreground">
              {token
                ? 'Your password has been successfully reset. You can now sign in with your new password.'
                : `We've sent a password reset link to ${email}. Please check your email and follow the instructions.`}
            </p>
          </div>
          <Button asChild className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 font-medium rounded-lg shadow-lg hover:shadow-xl">
            <Link href="/auth/signin">Back to Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Enhanced Primary Color Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/70 to-primary/50 transform rotate-12 scale-150 origin-top-right"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent"></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          {/* Top Header */}
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold text-primary-foreground">Nest HR</div>
            <div className="text-primary-foreground">
              <span className="mr-3">Remember your password?</span>
              <Link href="/auth/signin" className="bg-primary-foreground/20 backdrop-blur-sm text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary-foreground/30 transition-all duration-300 inline-flex items-center gap-2 border border-primary-foreground/30 shadow-lg">
                Sign in
              </Link>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="max-w-lg">
            {/* Icon with Enhanced Primary Styling */}
            <div className="mb-12">
              <div className="w-24 h-24 bg-primary-foreground/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-primary-foreground/30">
                <Shield className="w-12 h-12 text-primary-foreground" />
              </div>
            </div>
            
            {/* Text Content */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2 text-primary-foreground">
                Secure Your Account
              </h1>
              <div className="inline-block">
                <span className="text-4xl font-bold bg-primary-foreground/20 backdrop-blur-sm text-primary-foreground px-4 py-2 rounded-lg border border-primary-foreground/30 shadow-lg">
                  Reset Password
                </span>
              </div>
            </div>
            
            <p className="text-lg text-primary-foreground/90 mb-8">
              Don't worry! It happens to the best of us. We'll help you get back into your account 
              with a secure password reset process.
            </p>
            
            {/* Feature highlights with Primary Color Accents */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-primary-foreground/90">
                <div className="w-6 h-6 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                  <Shield className="w-3 h-3 text-primary-foreground" />
                </div>
                <span>Secure password reset</span>
              </div>
              <div className="flex items-center gap-3 text-primary-foreground/90">
                <div className="w-6 h-6 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                  <Users className="w-3 h-3 text-primary-foreground" />
                </div>
                <span>Quick account recovery</span>
              </div>
              <div className="flex items-center gap-3 text-primary-foreground/90">
                <div className="w-6 h-6 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                  <Zap className="w-3 h-3 text-primary-foreground" />
                </div>
                <span>Instant email delivery</span>
              </div>
            </div>
          </div>
          
          {/* Get Help Button with Enhanced Primary Styling */}
          <div>
            <button className="bg-primary-foreground/20 backdrop-blur-sm border-2 border-primary-foreground/30 text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary-foreground/30 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              Get help
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Right side - Reset Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-12 md:p-16 bg-gradient-to-br from-muted via-background to-muted">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Mobile Logo with Enhanced Primary Color */}
          <div className="lg:hidden mb-8 flex justify-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">Nest HR</span>
            </div>
          </div>
          
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {token ? 'Reset Your Password' : 'Forgot Your Password?'}
            </h2>
            <p className="text-muted-foreground">
              {token
                ? 'Enter your new password below'
                : "Enter your email and we'll send you a link to reset your password"}
            </p>
          </div>
          
          {/* Reset Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-center text-destructive">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}
            
            {!token ? (
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 shadow-sm bg-background"
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 shadow-sm bg-background"
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 shadow-sm bg-background"
                    placeholder="Confirm new password"
                  />
                </div>
              </>
            )}
            
            {/* Submit Button with Enhanced Primary Color */}
            <Button 
              type="submit" 
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {token ? 'Resetting Password...' : 'Sending Reset Link...'}
                </>
              ) : token ? (
                'Reset Password'
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </form>
          
          {/* Sign In Link */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              Remember your password?{' '}
              <Link href="/auth/signin" className="text-primary hover:text-primary/80 font-medium transition-colors duration-300">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
