'use client'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

export function SignOutButton() {
  const { logout } = useAuth()

  const handleSignOut = async () => {
    try {
      await logout()
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
