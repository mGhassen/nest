'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useSupabaseAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg font-medium">Verifying your email...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold">
            {success ? 'Email Verified!' : 'Verification Failed'}
          </CardTitle>
          <CardDescription>
            {success
              ? 'Your email has been successfully verified.'
              : 'We were unable to verify your email address.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex flex-col space-y-2">
            <Button asChild className="w-full">
              <Link href="/auth/signin">
                {success ? 'Continue to Sign In' : 'Back to Sign In'}
              </Link>
            </Button>
            
            {!success && (
              <Button variant="outline" asChild className="w-full">
                <Link href="/auth/signup">Create New Account</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
