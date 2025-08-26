'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useSupabaseAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Building2 } from 'lucide-react'

export default function VerifyEmailPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const searchParams = useSearchParams()
  const { verifyOtp } = useAuth()
  const token = searchParams.get('token')
  const type = searchParams.get('type')

  useEffect(() => {
    const verifyToken = async () => {
      if (!token || !type) {
        setError('Invalid verification link')
        setLoading(false)
        return
      }

      try {
        const { error } = await verifyOtp({ token, type })
        if (error) throw error
        setSuccess(true)
      } catch (err) {
        console.error('Verification error:', err)
        setError(err instanceof Error ? err.message : 'Failed to verify email')
      } finally {
        setLoading(false)
      }
    }

    verifyToken()
  }, [token, type, verifyOtp])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/5">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <p className="mt-4 text-lg font-medium text-foreground">Verifying your email...</p>
          <p className="text-sm text-muted-foreground mt-2">This may take a few moments</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-primary/5">
      <Card className="w-full max-w-md shadow-xl border-0 bg-background/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-1 pb-6">
          {/* Success/Error Icon */}
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
            {success ? (
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>
          
          <CardTitle className="text-2xl font-bold text-foreground">
            {success ? 'Email Verified!' : 'Verification Failed'}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {success
              ? 'Your email has been successfully verified. You can now sign in to your account.'
              : 'We were unable to verify your email address. Please try again or contact support.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
              <AlertDescription className="text-destructive">{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex flex-col space-y-3">
            <Button asChild className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              <Link href="/auth/signin">
                {success ? 'Continue to Sign In' : 'Back to Sign In'}
              </Link>
            </Button>
            
            {!success && (
              <Button variant="outline" asChild className="w-full h-12 border-primary/20 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 font-medium rounded-lg">
                <Link href="/auth/signup">Create New Account</Link>
              </Button>
            )}
          </div>
          
          {/* Additional Help */}
          {!success && (
            <div className="text-center text-sm text-muted-foreground pt-4 border-t border-border/50">
              <p>
                Need help?{' '}
                <Link href="#" className="text-primary hover:text-primary/80 font-medium transition-colors duration-300">
                  Contact support
                </Link>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
