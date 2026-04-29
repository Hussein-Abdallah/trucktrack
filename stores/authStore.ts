import { create } from 'zustand';

import { signOut as serviceSignOut } from '@/services/auth';
import type { Profile } from '@/lib/types';

// Derived from Profile so a schema change flows through automatically —
// CLAUDE.md rule: "Always use shared types from lib/types.ts — never
// inline one-off interfaces for DB entities."
export type UserRole = Profile['roles'][number];

export interface AuthSession {
  userId: string;
  roles: Profile['roles'];
}

interface AuthState {
  session: AuthSession | null;
  /** True until the first onAuthStateChange event lands (or the
   *  5s fallback trips). app/index.tsx shows a splash spinner while
   *  isResolving is true so the gate doesn't flicker through login on
   *  cold-start with a cached session. */
  isResolving: boolean;
  setSession: (session: AuthSession | null) => void;
  signOut: () => Promise<void>;
  markResolved: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  // Start true so the splash holds until useAuthSubscription resolves.
  isResolving: true,
  setSession: (session) => set({ session, isResolving: false }),
  signOut: async () => {
    try {
      await serviceSignOut();
    } catch (err) {
      // Network or token-revocation failure shouldn't trap the user in
      // an authed state. The subscription will also fire SIGNED_OUT and
      // clear; this is belt-and-suspenders so even a hard error path
      // returns the user to /auth/login.
      // eslint-disable-next-line no-console
      console.warn('[authStore] signOut failed:', err);
    }
    set({ session: null });
  },
  markResolved: () => set({ isResolving: false }),
}));
