# Authentication Flow

This application uses Supabase Auth for authentication and authorization. The authentication flow is handled through middleware and API routes.

## Key Files

1. **Middleware**
   - `middleware.auth.ts`: Handles route protection and authentication state
   - `middleware.ts`: General middleware (currently minimal)

2. **Auth Utilities**
   - `lib/auth-utils.ts`: Client-side auth utilities
   - `lib/server/auth-utils.ts`: Server-side auth utilities
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
import { requireServerAuth } from '@/lib/server/auth-utils';

export async function GET(request: Request) {
  const { user, error } = await requireServerAuth('admin');
  
  if (error) {
    return new Response(error, { status: error === 'Unauthorized' ? 401 : 403 });
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
import { getSession } from '@/lib/auth-utils';

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
