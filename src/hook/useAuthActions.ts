'use client';

import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export async function handleGithubLogin() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    console.error('OAuth error:', error.message);
  }
}

export async function handleGoogleLogin() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    console.error('OAuth error:', error.message);
  }
}

export async function signOut() {
  await supabase.auth.signOut();
  window.location.href = '/auth';
}

export async function refreshSession() {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error('Session refresh error:', error.message);
      // If refresh fails, redirect to auth
      window.location.href = '/auth';
      return null;
    }
    return data.session;
  } catch (error) {
    console.error('Unexpected error refreshing session:', error);
    window.location.href = '/auth';
    return null;
  }
}

export async function getCurrentUserProfile() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return null;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', session.user.id)
      .single();
    if (error) {
      console.error('Profile fetch error:', error.message);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}
