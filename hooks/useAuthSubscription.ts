import { useEffect } from 'react';

import { getAppVariant } from '@/lib/appVariant';
import { ensureRoleForVariant, onAuthStateChange } from '@/services/auth';
import { fetchProfileRoles } from '@/services/profile';
import { useAuthStore } from '@/stores/authStore';

// Defensive fallback: if Supabase's onAuthStateChange never fires (hung
// network, broken AsyncStorage, etc.), we don't want the splash spinner
// to deadlock forever. After 5s, force markResolved with no session so
// the route gate can take the user to /auth/login.
const RESOLVE_TIMEOUT_MS = 5000;

// Module-level flag set by the reset-password screen before it calls
// setSession with recovery tokens. While true, the subscription skips
// store hydration so the route gate doesn't redirect the user away
// from /auth/reset-password mid-flow. Cleared after updateUser + sign
// out land. Exported as a setter to keep the mutation point explicit.
let recoveryInProgress = false;
export function setRecoveryInProgress(value: boolean): void {
  recoveryInProgress = value;
}

/**
 * Root-level hook: wires Supabase auth events to the auth store.
 *
 * - INITIAL_SESSION (fires on subscribe whether or not there's a cached
 *   session): hydrates the store from the cached session if present.
 * - SIGNED_IN (after login or signup): fetches profile.roles, appends
 *   the variant's role if missing (multi-role auto-append per TT-48
 *   decision), hydrates the store.
 * - SIGNED_OUT: clears the store.
 * - markResolved fires after the first event lands or the 5s fallback
 *   trips, whichever comes first — so app/index.tsx can stop showing
 *   the splash spinner.
 *
 * Mounted exactly once at the root layout. Re-mounts (Fast Refresh)
 * tear down the prior subscription first via the cleanup return.
 */
export function useAuthSubscription(): void {
  const setSession = useAuthStore((state) => state.setSession);
  const markResolved = useAuthStore((state) => state.markResolved);

  useEffect(() => {
    const variant = getAppVariant();
    let cancelled = false;
    let resolved = false;
    const markResolvedOnce = () => {
      if (resolved || cancelled) return;
      resolved = true;
      markResolved();
    };

    // Defensive: if no event lands within RESOLVE_TIMEOUT_MS, force
    // resolution so the splash spinner unblocks.
    const timer = setTimeout(markResolvedOnce, RESOLVE_TIMEOUT_MS);

    const unsubscribe = onAuthStateChange((event, session) => {
      if (cancelled) return;
      void (async () => {
        try {
          if (event === 'SIGNED_OUT' || !session) {
            setSession(null);
            return;
          }
          if (event === 'PASSWORD_RECOVERY' || recoveryInProgress) {
            // Recovery session — don't hydrate the auth store. The
            // reset-password screen needs the supabase client session
            // to call updateUser, but the app shouldn't treat the user
            // as fully signed in. After updateUser + signOut, SIGNED_OUT
            // fires and the store stays clear. The route gate keeps the
            // user on /auth/reset-password since no session is set.
            return;
          }
          const userId = session.user.id;
          let roles = await fetchProfileRoles(userId);
          if (!roles.includes(variant)) {
            // Multi-role auto-append: a consumer signing into the
            // operator app picks up the operator role atomically here
            // before the gate evaluates.
            await ensureRoleForVariant(userId, variant);
            roles = [...roles, variant];
          }
          if (cancelled) return;
          setSession({ userId, roles });
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn('[auth-subscription] event handling failed:', err);
          if (!cancelled) setSession(null);
        } finally {
          markResolvedOnce();
        }
      })();
    });

    return () => {
      cancelled = true;
      clearTimeout(timer);
      unsubscribe();
    };
  }, [setSession, markResolved]);
}
