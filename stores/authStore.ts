import { create } from 'zustand';

export type UserRole = 'consumer' | 'operator';

export interface AuthSession {
  userId: string;
  role: UserRole;
}

interface AuthState {
  session: AuthSession | null;
  isResolving: boolean;
  signInAs: (role: UserRole) => void;
  signOut: () => void;
  markResolved: () => void;
}

// TODO(TT-11/TT-13): replace signInAs with real Supabase auth — subscribe to
// supabase.auth.onAuthStateChange and fetch profiles.role for the signed-in user.
export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isResolving: false,
  signInAs: (role) => set({ session: { userId: `dev-${role}`, role }, isResolving: false }),
  signOut: () => set({ session: null }),
  markResolved: () => set({ isResolving: false }),
}));
