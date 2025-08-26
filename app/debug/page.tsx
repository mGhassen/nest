"use client"

import { useState } from "react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function DebugPage() {
  const [email, setEmail] = useState("admin@guepard.run")
  const [password, setPassword] = useState("admin123")
  const [status, setStatus] = useState("")
  const [user, setUser] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  
  const supabase = createClientComponentClient()

  const testSignIn = async () => {
    setStatus("Signing in...")
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        setStatus(`Error: ${error.message}`)
        return
      }
      
      setStatus("Sign in successful!")
      setUser(data.user)
      setSession(data.session)
      
      // Test profile lookup
      if (data.user) {
        setStatus("Looking up profile...")
        const { data: profile, error: profileError } = await supabase
          .from('accounts')
          .select('*')
          .eq('auth_user_id', data.user.id)
          .single()
        
        if (profileError) {
          setStatus(`Profile lookup error: ${profileError.message}`)
        } else {
          setStatus(`Profile found: ${profile.role}`)
        }
      }
      
    } catch (err) {
      setStatus(`Exception: ${err}`)
    }
  }

  const testGetUser = async () => {
    setStatus("Getting user...")
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        setStatus(`Get user error: ${error.message}`)
      } else {
        setStatus(`User: ${user ? user.email : 'None'}`)
        setUser(user)
      }
    } catch (err) {
      setStatus(`Exception: ${err}`)
    }
  }

  const testGetSession = async () => {
    setStatus("Getting session...")
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        setStatus(`Get session error: ${error.message}`)
      } else {
        setStatus(`Session: ${session ? 'Active' : 'None'}`)
        setSession(session)
      }
    } catch (err) {
      setStatus(`Exception: ${err}`)
    }
  }

  const signOut = async () => {
    setStatus("Signing out...")
    try {
      await supabase.auth.signOut()
      setStatus("Signed out")
      setUser(null)
      setSession(null)
    } catch (err) {
      setStatus(`Sign out error: ${err}`)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug Page</h1>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      <div className="space-x-2 mb-6">
        <button
          onClick={testSignIn}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Sign In
        </button>
        <button
          onClick={testGetUser}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Get User
        </button>
        <button
          onClick={testGetSession}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Get Session
        </button>
        <button
          onClick={signOut}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Sign Out
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Status:</h2>
        <div className="p-3 bg-gray-100 rounded">{status}</div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">User:</h3>
          <pre className="p-3 bg-gray-100 rounded text-sm overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Session:</h3>
          <pre className="p-3 bg-gray-100 rounded text-sm overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
