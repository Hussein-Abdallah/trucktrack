import { create } from 'zustand';

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
  isResolving: boolean;
  signInAs: (role: UserRole) => void;
  signOut: () => void;
  markResolved: () => void;
}

// TODO(TT-32): replace signInAs with real Supabase auth — subscribe to
// supabase.auth.onAuthStateChange and fetch profiles.roles for the signed-in user.
export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isResolving: false,
  signInAs: (role) =>
    set({ session: { userId: `dev-${role}`, roles: [role] }, isResolving: false }),
  signOut: () => set({ session: null }),
  markResolved: () => set({ isResolving: false }),
}));
