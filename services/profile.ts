import type { UserRole } from '@/lib/types';
import { supabase } from '@/services/supabase';

/**
 * Fetches the `roles` array for a profile by user id. Used by the
 * root layout's auth subscription to hydrate `authStore.session.roles`
 * after a Supabase `SIGNED_IN` / `INITIAL_SESSION` event.
 *
 * Returns `[]` if the row is missing — the caller's gate treats empty
 * roles as a broken session and forces the user back to login. The DB
 * has a CHECK constraint enforcing non-empty roles (TT-13), so an
 * empty array here means the profile row didn't get created (which
 * is itself a bug worth surfacing via signOut + relogin).
 */
export async function fetchProfileRoles(userId: string): Promise<UserRole[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return [];
  return data.roles;
}
