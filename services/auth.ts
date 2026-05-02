import type {
  AuthChangeEvent,
  AuthError as SupabaseAuthError,
  Session,
  User,
} from '@supabase/supabase-js';

import { AppError, NetworkError, isNetworkError } from '@/lib/errors';
import type { AppLanguage, UserRole } from '@/lib/types';
import { supabase } from '@/services/supabase';

// -- Typed errors -----------------------------------------------------
// Every public entry point throws an AuthError subclass. Raw
// SupabaseAuthError / PostgrestError never leaves this module, so
// callers branch on `err instanceof EmailAlreadyRegisteredError`
// rather than pattern-matching on messages.

export abstract class AuthError extends AppError {}

export class EmailAlreadyRegisteredError extends AuthError {}
export class InvalidRoleError extends AuthError {}
export class UnknownAuthError extends AuthError {}

export { NetworkError };

// -- Public API -------------------------------------------------------

export interface SignUpArgs {
  email: string;
  password: string;
  role: UserRole;
  /** Defaults to 'en' via the profiles.language column default (TT-11). */
  language?: AppLanguage;
  displayName?: string;
}

export interface SignInArgs {
  email: string;
  password: string;
}

export interface AuthResult {
  /** Null when email-confirmation is on and the user must verify before a session is issued. */
  session: Session | null;
  user: User;
}

export async function signUp(args: SignUpArgs): Promise<AuthResult> {
  const { email, password, role, language, displayName } = args;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        language,
        display_name: displayName,
      },
    },
  });

  if (error) throw mapSupabaseAuthError(error);
  if (!data.user) throw new UnknownAuthError('signUp returned without a user');

  // Supabase quirk — when email confirmations are on (the default),
  // signUp against an already-registered email silently returns a user
  // with an empty `identities` array instead of an error. This is the
  // documented tell-tale. Surface it as a typed error so callers can
  // branch to "this email already has an account, sign in to add a
  // role" instead of silently re-sending a confirmation email.
  if ((data.user.identities?.length ?? 0) === 0) {
    throw new EmailAlreadyRegisteredError('Email already registered');
  }

  return { session: data.session, user: data.user };
}

export async function signIn(args: SignInArgs): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword(args);
  if (error) throw mapSupabaseAuthError(error);
  if (!data.user) throw new UnknownAuthError('signIn returned without a user');
  return { session: data.session, user: data.user };
}

export async function signOut(): Promise<void> {
  // Default scope in supabase-js is 'global', which revokes every
  // session across every device. Use 'local' so tapping "sign out" on
  // this phone doesn't also log the user out on their tablet / web.
  // Callers that truly want cross-device logout should wrap their own
  // helper rather than flip this default.
  const { error } = await supabase.auth.signOut({ scope: 'local' });
  if (error) throw mapSupabaseAuthError(error);
}

// Idempotent: appends the variant's role to profiles.roles, or no-ops
// if already present. Delegated to the public.profiles_add_role RPC
// (security definer, atomic UPDATE with array_append + conditional
// WHERE) so concurrent callers don't lose updates — the read-then-
// write equivalent in the client is racy under row contention.
export async function ensureRoleForVariant(userId: string, role: UserRole): Promise<void> {
  const { error } = await supabase.rpc('profiles_add_role', {
    p_user_id: userId,
    p_role: role,
  });
  if (error) throw mapSupabasePostgrestError(error);
}

// Returns a plain unsubscribe fn — consumers don't need to know the
// Supabase subscription shape (`{ data: { subscription: { unsubscribe } } }`).
export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void,
): () => void {
  const { data } = supabase.auth.onAuthStateChange(callback);
  return () => data.subscription.unsubscribe();
}

// -- Internal error mapping ------------------------------------------
// String-matching on error messages is brittle but is the current
// surface Supabase gives us. When supabase-js ships typed error codes
// we can replace these substring checks with code-based branches.

function violatesRolesCheck(message: string): boolean {
  // Either the CHECK constraint fires directly on INSERT / UPDATE, or
  // GoTrue wraps the trigger failure as "Database error saving new
  // user". The CHECK-constraint name is the most specific tell.
  return message.includes('profiles_roles_valid');
}

function mapSupabaseAuthError(err: SupabaseAuthError): AuthError | NetworkError {
  const message = err.message;
  if (isNetworkError(err)) return new NetworkError(message);
  if (message.includes('User already registered')) {
    return new EmailAlreadyRegisteredError(message);
  }
  if (violatesRolesCheck(message)) return new InvalidRoleError(message);
  return new UnknownAuthError(message);
}

function mapSupabasePostgrestError(err: {
  message: string;
  code?: string;
}): AuthError | NetworkError {
  const message = err.message;
  if (isNetworkError(err)) return new NetworkError(message);
  // SQLSTATE 22004 (null_value_not_allowed) — profiles_add_role raises
  // this when p_role is null or empty. Same user-facing meaning as a
  // profiles_roles_valid CHECK violation: the caller passed something
  // that isn't a usable UserRole.
  if (err.code === '22004' || violatesRolesCheck(message)) {
    return new InvalidRoleError(message);
  }
  return new UnknownAuthError(message);
}
