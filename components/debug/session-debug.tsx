"use client";

import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function SessionDebug() {
  const { user, isLoading, isAuthenticated, authError, recoverSession, cleanupTokens } = useAuth();
  const [sessionInfo, setSessionInfo] = useState<{ expires_at: number } | null>(null);
  const [localStorageInfo, setLocalStorageInfo] = useState<string>("");
  const [allStorageKeys, setAllStorageKeys] = useState<string[]>([]);

  useEffect(() => {
    const checkLocalStorage = () => {
      const authToken = localStorage.getItem('nest.auth.token');
      if (authToken) {
        try {
          const parsed = JSON.parse(authToken);
          setLocalStorageInfo(`Present (expires: ${new Date(parsed.expires_at * 1000).toLocaleTimeString()})`);
          // Set session info from localStorage since we're using custom auth
          setSessionInfo(parsed);
        } catch {
          setLocalStorageInfo('Present (invalid format)');
          setSessionInfo(null);
        }
      } else {
        setLocalStorageInfo('Not found');
        setSessionInfo(null);
      }
      
      // Show all localStorage keys
      const keys = Object.keys(localStorage);
      setAllStorageKeys(keys);
    };

    checkLocalStorage();

    const interval = setInterval(() => {
      checkLocalStorage();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">Session Debug</h3>
      <div className="space-y-1">
        <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
        <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
        <div>User: {user ? user.email : 'None'}</div>
        <div>Role: {user ? user.role : 'None'}</div>
        <div>Auth Error: {authError || 'None'}</div>
        <div>Session: {sessionInfo ? 'Present' : 'None'}</div>
        <div>LocalStorage: {localStorageInfo}</div>
        {sessionInfo && (
          <div>Expires: {new Date(sessionInfo.expires_at * 1000).toLocaleTimeString()}</div>
        )}
        <div className="mt-2">
          <div className="text-xs text-gray-300">Storage Keys:</div>
          <div className="text-xs text-gray-400 max-h-20 overflow-y-auto">
            {allStorageKeys.map(key => (
              <div key={key} className={key.includes('token') || key.includes('auth') ? 'text-yellow-300' : ''}>
                {key}
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          {!isAuthenticated && localStorageInfo.includes('Present') && (
            <Button 
              onClick={recoverSession} 
              size="sm" 
              className="flex-1"
            >
              Recover
            </Button>
          )}
          <Button 
            onClick={cleanupTokens} 
            size="sm" 
            variant="destructive"
            className="flex-1"
          >
            Clean Tokens
          </Button>
        </div>
      </div>
    </div>
  );
}
