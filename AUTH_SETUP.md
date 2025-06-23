# Authentication Setup with Supabase

This document outlines how to integrate Supabase authentication with the Stendhal application.

## Current Setup

The application currently has a mock authentication system with:
- GitHub and Google OAuth providers
- Protected routes
- Authentication context
- Sign-out functionality

## Supabase Integration Steps

### 1. Install Supabase Client

```bash
npm install @supabase/supabase-js
```

### 2. Create Supabase Client

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 3. Environment Variables

Add to your `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Update Auth Context

Replace the TODO comments in `src/lib/auth.tsx` with actual Supabase calls:

```typescript
// Check for existing session
const { data: { session } } = await supabase.auth.getSession();
if (session?.user) {
  setUser({
    id: session.user.id,
    email: session.user.email!,
    name: session.user.user_metadata?.full_name,
    avatar_url: session.user.user_metadata?.avatar_url,
  });
}

// Sign in
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: provider,
  options: {
    redirectTo: `${window.location.origin}/dashboard`
  }
});

// Sign out
await supabase.auth.signOut();
```

### 5. Supabase Dashboard Setup

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Providers
3. Enable GitHub and Google providers
4. Configure OAuth settings for each provider:
   - **GitHub**: Create OAuth app in GitHub settings
   - **Google**: Create OAuth credentials in Google Cloud Console

### 6. OAuth Configuration

#### GitHub OAuth App
- Homepage URL: `http://localhost:3000` (development)
- Authorization callback URL: `http://localhost:3000/auth/callback`

#### Google OAuth
- Authorized JavaScript origins: `http://localhost:3000`
- Authorized redirect URIs: `http://localhost:3000/auth/callback`

### 7. Auth Callback Handler

Create `src/app/auth/callback/route.ts`:

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(requestUrl.origin + '/dashboard')
}
```

## Features

- ✅ GitHub OAuth
- ✅ Google OAuth  
- ✅ Protected routes
- ✅ Authentication context
- ✅ Sign-out functionality
- ✅ Loading states
- ✅ Error handling
- ✅ Responsive design

## Usage

1. Users visit `/auth` to sign in
2. After successful authentication, they're redirected to `/dashboard`
3. Protected routes automatically redirect unauthenticated users to `/auth`
4. Users can sign out using the button in the navbar

## Security

- All authentication state is managed by Supabase
- Protected routes prevent unauthorized access
- OAuth tokens are handled securely by Supabase
- No sensitive data is stored in local storage 