'use client'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth/auth-context'

export function SignOutButton() {
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <Button variant="ghost" onClick={handleSignOut}>
      Sign Out
    </Button>
  )
}
