# Authentication Flow

This application uses Supabase Auth for authentication and authorization. The authentication flow is handled through middleware and consolidated auth utilities.

## Key Files

1. **Middleware**
   - `middleware.ts`: Handles route protection, authentication state, and role-based access control

2. **Auth Utilities**
   - `lib/auth.ts`: Consolidated auth utilities for both client and server-side use
   - `lib/auth-context.tsx`: React context for client-side auth state management
   - `app/api/auth/[...nextauth]/route.ts`: Auth callback handler

3. **Components**
   - `components/auth/*`: Authentication UI components
   - `app/auth/*`: Authentication pages

## Authentication Flow

1. **Sign In**
   - User enters credentials on `/auth/signin`
   - Supabase Auth handles the authentication
   - On success, user is redirected to the dashboard or the originally requested page

2. **Protected Routes**
   - Middleware checks for an active session
   - Unauthenticated users are redirected to the sign-in page
   - Authenticated users can access protected routes

3. **Role-Based Access Control (RBAC)**
   - User roles are stored in the `profiles` table
   - The `requireAuth` function can check for specific roles
   - Admin-only routes (`/admin/*`, `/api/admin/*`) are automatically protected
   - Unauthorized access results in a redirect to `/unauthorized`

## Environment Variables

Make sure these environment variables are set in your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## API Routes

API routes can use the server-side auth utilities to protect endpoints:

```typescript
import { requireAuth } from '@/lib/auth';

export async function GET(request: Request) {
  const { user, redirect } = await requireAuth('admin');
  
  if (redirect) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Handle authenticated request
}
```

## Client-Side Authentication

Use the auth utilities in your components:

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default function ProtectedPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getSession();
      if (!session) {
        router.push('/auth/signin');
      }
    };
    
    checkAuth();
  }, [router]);

  return <div>Protected Content</div>;
}
```

## Route Protection

The middleware automatically protects routes based on the following rules:

- **Public routes**: `/auth/*`, `/api/auth/*`, static files
- **Admin-only routes**: `/admin/*`, `/api/admin/*` (requires admin role)
- **Protected routes**: All other routes require authentication
- **API routes**: `/api/*` routes are handled separately and should implement their own auth checks

## Auth Context Usage

For components that need access to auth state:

```typescript
'use client';

import { useAuth } from '@/lib/auth/auth-context';

export default function UserProfile() {
  const { user, isLoading, signOut } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>Not authenticated</div>;
  
  return (
    <div>
      <p>Welcome, {user.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```
