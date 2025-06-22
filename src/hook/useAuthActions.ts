'use client';

import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export async function handleGithubLogin() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: 'http://localhost:3000/auth/callback',
    },
  });

  if (error) {
    console.error('OAuth error:', error.message);
  }
}
