'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useSupabaseAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

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
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-2xl font-bold">
              {token ? 'Password Reset Successful' : 'Check Your Email'}
            </CardTitle>
            <CardDescription>
              {token
                ? 'Your password has been successfully reset. You can now sign in with your new password.'
                : `We've sent a password reset link to ${email}. Please check your email and follow the instructions.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/auth/signin">Back to Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {token ? 'Reset Your Password' : 'Forgot Your Password?'}
          </CardTitle>
          <CardDescription className="text-center">
            {token
              ? 'Enter your new password below'
              : "Enter your email and we'll send you a link to reset your password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {!token ? (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </>
            )}
            
            <Button type="submit" className="w-full" disabled={loading}>
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
          
          <div className="mt-4 text-center text-sm">
            Remember your password?{' '}
            <Link href="/auth/signin" className="text-primary underline-offset-4 hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
