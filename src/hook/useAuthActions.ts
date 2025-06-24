'use client';

import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export async function handleGithubLogin() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: 'http://memoforge.vercel.app/dashboard',
      // redirectTo: 'http://localhost:3000/auth/callback',
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

export async function getCurrentUserProfile() {
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
}
