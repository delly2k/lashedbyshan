import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';
import { createClient } from '@/lib/supabase/server';

export class AdminAuthError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'AdminAuthError';
  }
}

export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase, user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  return { supabase, user, profile };
}

export async function requireAdmin(): Promise<{
  supabase: SupabaseClient<Database>;
  user: NonNullable<Awaited<ReturnType<typeof getAuthenticatedUser>>['user']>;
  profile: NonNullable<Awaited<ReturnType<typeof getAuthenticatedUser>>['profile']>;
}> {
  const { supabase, user, profile } = await getAuthenticatedUser();

  if (!user || !profile || profile.role !== 'admin') {
    throw new AdminAuthError();
  }

  return { supabase, user, profile };
}

export function isAdminProfile(
  profile: Awaited<ReturnType<typeof getAuthenticatedUser>>['profile'],
) {
  return profile?.role === 'admin';
}
