'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const finalizeLogin = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error fetching session:', error.message);
        router.push('/auth'); // Redirect to home or login on error
        return;
      }

      if (data?.session) {
        router.push('/dashboard'); // Successful login — go to protected route
      }
    };

    finalizeLogin();
  }, [router]);
}
