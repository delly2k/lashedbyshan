'use client';

import { useCallback, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function useAdminAuth() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectPath = searchParams.get('redirect') ?? '/admin';

  const signIn = useCallback(
    async (email: string, password: string) => {
      setIsSubmitting(true);
      setError(null);

      try {
        const supabase = createClient();
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) {
          throw signInError;
        }

        router.replace(redirectPath);
        router.refresh();
      } catch (signInError) {
        setError(
          signInError instanceof Error
            ? signInError.message
            : 'Unable to sign in.',
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [redirectPath, router],
  );

  const signOut = useCallback(async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace('/admin/login');
    router.refresh();
  }, [router]);

  return {
    signIn,
    signOut,
    isSubmitting,
    error,
    unauthorized: searchParams.get('error') === 'unauthorized',
  };
}
