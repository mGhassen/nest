"use client";

import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function SessionDebug() {
  const { user, isLoading, isAuthenticated, authError, logout } = useAuth();
  const [sessionInfo, setSessionInfo] = useState<{ expires_at: number } | null>(null);
  const [localStorageInfo, setLocalStorageInfo] = useState<string>("");
  const [allStorageKeys, setAllStorageKeys] = useState<string[]>([]);
  const [accessTokenStatus, setAccessTokenStatus] = useState<string>("");
  const [refreshTokenStatus, setRefreshTokenStatus] = useState<string>("");

  useEffect(() => {
    const checkLocalStorage = () => {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      
      setAccessTokenStatus(accessToken ? 'Present' : 'None');
      setRefreshTokenStatus(refreshToken ? 'Present' : 'None');
      
      if (accessToken) {
        try {
          // Try to decode JWT to get expiration
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          const expiresAt = payload.exp * 1000; // Convert to milliseconds
          setLocalStorageInfo(`Present (expires: ${new Date(expiresAt).toLocaleTimeString()})`);
          setSessionInfo({ expires_at: payload.exp });
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
        <div>Role: {user ? (user.isAdmin ? 'Admin' : 'Employee') : 'None'}</div>
        <div>Name: {user ? `${user.firstName} ${user.lastName}` : 'None'}</div>
        <div>Auth Error: {authError || 'None'}</div>
        <div>Access Token: {accessTokenStatus}</div>
        <div>Refresh Token: {refreshTokenStatus}</div>
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
          <Button 
            onClick={() => {
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              if (typeof window !== 'undefined') {
                delete window.__authToken;
              }
              window.location.reload();
            }} 
            size="sm" 
            variant="destructive"
            className="flex-1"
          >
            Clean Tokens
          </Button>
          {isAuthenticated && (
            <Button 
              onClick={logout} 
              size="sm" 
              variant="outline"
              className="flex-1"
            >
              Logout
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
