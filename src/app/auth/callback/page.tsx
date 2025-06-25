'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export default function AuthCallbackPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const finalizeLogin = async () => {
      try {
        // Get the session after OAuth redirect
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error fetching session:', error.message);
          setError('Authentication failed. Please try again.');
          setIsLoading(false);
          return;
        }

        if (data?.session) {
          // Successful login — redirect to dashboard
          router.push('/dashboard');
        } else {
          // No session found, redirect back to auth
          setError('No session found. Please try logging in again.');
          setIsLoading(false);
          setTimeout(() => {
            router.push('/auth');
          }, 2000);
        }
      } catch (err) {
        console.error('Unexpected error during auth callback:', err);
        setError('An unexpected error occurred. Please try again.');
        setIsLoading(false);
        setTimeout(() => {
          router.push('/auth');
        }, 2000);
      }
    };

    finalizeLogin();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Completing sign in...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-foreground-muted">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return null;
}
