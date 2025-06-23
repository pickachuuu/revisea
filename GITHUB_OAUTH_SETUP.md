# GitHub OAuth Setup Guide

This guide will help you set up GitHub OAuth authentication for your Stendhal application using Supabase.

## 🚀 Step 1: Create GitHub OAuth App

### 1. Go to GitHub Developer Settings

1. Visit [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**

### 2. Configure OAuth App

Fill in the following details:

```
Application name: Stendhal
Homepage URL: http://localhost:3000 (for development)
Application description: A smart note-taking and flashcard application
Authorization callback URL: http://localhost:3000/auth/callback
```

**Important Notes:**
- For production, replace `localhost:3000` with your actual domain
- The callback URL must match exactly what you configure in Supabase
- You can add multiple callback URLs for different environments

### 3. Register the App

1. Click **"Register application"**
2. Note down your **Client ID** and **Client Secret**

## 🔧 Step 2: Configure Supabase

### 1. Go to Supabase Dashboard

1. Open your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**

### 2. Enable GitHub Provider

1. Find **GitHub** in the providers list
2. Toggle the switch to **Enable**
3. Enter your GitHub OAuth credentials:
   - **Client ID**: Your GitHub OAuth App Client ID
   - **Client Secret**: Your GitHub OAuth App Client Secret

### 3. Configure Redirect URLs

In the **Redirect URLs** section, add:
```
http://localhost:3000/auth/callback
```

For production, also add:
```
https://yourdomain.com/auth/callback
```

## 📦 Step 3: Install Dependencies

Install the required Supabase packages:

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

## 🔄 Step 4: Update Environment Variables

Add these to your `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# GitHub OAuth (optional, for additional features)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

## 🔧 Step 5: Update Auth Context

Replace the TODO comments in `src/lib/auth.tsx` with actual Supabase calls:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// In the signIn function:
const signIn = async (provider: 'github' | 'google') => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  
  if (error) throw error;
};

// In the signOut function:
const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
```

## 🧪 Step 6: Test the Setup

### 1. Start Development Server

```bash
npm run dev
```

### 2. Test Authentication Flow

1. Visit `http://localhost:3000`
2. You should be redirected to `/auth`
3. Click **"Continue with GitHub"**
4. You should be redirected to GitHub for authorization
5. After authorizing, you should be redirected back to `/dashboard`

### 3. Check for Errors

If you encounter issues, check:

1. **Browser Console**: Look for JavaScript errors
2. **Network Tab**: Check for failed requests
3. **Supabase Logs**: Go to Supabase Dashboard → Logs
4. **GitHub OAuth App Settings**: Verify callback URLs

## 🔍 Troubleshooting

### Common Issues

#### 1. "Invalid redirect_uri" Error

**Cause**: The callback URL doesn't match between GitHub and Supabase
**Solution**: 
- Check GitHub OAuth App settings
- Verify Supabase redirect URL configuration
- Ensure no trailing slashes or typos

#### 2. "Application error" in Supabase

**Cause**: Missing or incorrect environment variables
**Solution**:
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Check that the values are correct and not wrapped in quotes

#### 3. "No authorization code received"

**Cause**: OAuth flow was interrupted or callback URL is wrong
**Solution**:
- Check the callback route is working
- Verify the redirect URL in both GitHub and Supabase
- Ensure the callback route can handle the authorization code

#### 4. "Session exchange failed"

**Cause**: Issues with the callback handler
**Solution**:
- Check that `@supabase/auth-helpers-nextjs` is installed
- Verify the callback route implementation
- Check Supabase logs for detailed error messages

### Debug Steps

1. **Enable Debug Logging**:
   ```typescript
   const supabase = createClient(supabaseUrl, supabaseAnonKey, {
     auth: {
       debug: true
     }
   });
   ```

2. **Check Network Requests**:
   - Open browser dev tools
   - Go to Network tab
   - Look for requests to `/auth/callback`
   - Check response status and content

3. **Verify Supabase Configuration**:
   - Go to Supabase Dashboard → Authentication → Settings
   - Check Site URL configuration
   - Verify redirect URLs

## 🚀 Production Deployment

### 1. Update GitHub OAuth App

1. Go to your GitHub OAuth App settings
2. Update **Homepage URL** to your production domain
3. Update **Authorization callback URL** to your production callback URL

### 2. Update Supabase Configuration

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Update **Site URL** to your production domain
3. Add production redirect URLs

### 3. Environment Variables

Update your production environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
```

## 🔒 Security Considerations

1. **Never expose Client Secret**: Keep it server-side only
2. **Use HTTPS**: Always use HTTPS in production
3. **Validate Redirect URLs**: Ensure callback URLs are secure
4. **Rate Limiting**: Implement rate limiting for auth endpoints
5. **Session Management**: Use secure session handling

## 📝 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Next.js Authentication](https://nextjs.org/docs/authentication)

## ✅ Checklist

- [ ] GitHub OAuth App created
- [ ] Supabase GitHub provider enabled
- [ ] Redirect URLs configured
- [ ] Dependencies installed
- [ ] Environment variables set
- [ ] Auth context updated
- [ ] Callback route implemented
- [ ] Authentication flow tested
- [ ] Production URLs updated (when deploying) 