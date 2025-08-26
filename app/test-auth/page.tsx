"use client"

import { useAuth } from "@/lib/auth/auth-context"
import { useEffect, useState } from "react"

export default function TestAuthPage() {
  const { user, isLoading } = useAuth()
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    setDebugInfo({
      user,
      isLoading,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    })
  }, [user, isLoading])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Debug Page</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold">Auth Context State:</h2>
          <pre className="mt-2 text-sm bg-gray-100 p-2 rounded">
            {JSON.stringify({ user, isLoading }, null, 2)}
          </pre>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold">Debug Info:</h2>
          <pre className="mt-2 text-sm bg-gray-100 p-2 rounded">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold">Status:</h2>
          <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
          <p>User: {user ? 'Yes' : 'No'}</p>
          <p>User Role: {user?.role || 'None'}</p>
          <p>User Email: {user?.email || 'None'}</p>
        </div>
      </div>
    </div>
  )
}
