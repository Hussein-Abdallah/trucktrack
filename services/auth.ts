import type {
  AuthChangeEvent,
  AuthError as SupabaseAuthError,
  Session,
  User,
} from '@supabase/supabase-js';

import type { AppLanguage, Profile, UserRole } from '@/lib/types';
import { supabase } from '@/services/supabase';

// -- Typed errors -----------------------------------------------------
// Every public entry point throws an AuthError subclass. Raw
// SupabaseAuthError / PostgrestError never leaves this module, so
// callers branch on `err instanceof EmailAlreadyRegisteredError`
// rather than pattern-matching on messages.

export abstract class AuthError extends Error {
  constructor(message: string) {
    super(message);
    // Keep the class name stable across minification so callers can
    // safely `err.name === 'EmailAlreadyRegisteredError'` in logs.
    this.name = new.target.name;
  }
}

export class EmailAlreadyRegisteredError extends AuthError {}
export class InvalidRoleError extends AuthError {}
export class NetworkError extends AuthError {}
export class UnknownAuthError extends AuthError {}

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

// Idempotent: reads current profile.roles and only writes when the
// target role isn't already present. Callers invoke this post-sign-in
// to guarantee the variant's role is recorded when the same email
// signs into the second app binary.
export async function ensureRoleForVariant(userId: string, role: UserRole): Promise<void> {
  // maybeSingle (vs single) returns data=null for zero rows rather than
  // erroring — makes the explicit "Profile row missing" branch below
  // reachable when the trigger somehow didn't materialise a row.
  const { data, error: selectError } = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', userId)
    .maybeSingle();

  if (selectError) throw mapSupabasePostgrestError(selectError);
  if (!data) throw new UnknownAuthError('Profile row missing for authenticated user');

  if (data.roles.includes(role)) return;

  const nextRoles: Profile['roles'] = [...data.roles, role];
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ roles: nextRoles })
    .eq('id', userId);

  if (updateError) throw mapSupabasePostgrestError(updateError);
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

interface PostgrestLikeError {
  message: string;
  code?: string;
  details?: string;
}

function isNetworkError(message: string, name?: string): boolean {
  if (name === 'AuthRetryableFetchError') return true;
  const lower = message.toLowerCase();
  return lower.includes('network request failed') || lower.includes('failed to fetch');
}

function violatesRolesCheck(message: string): boolean {
  // Either the CHECK constraint fires directly on INSERT / UPDATE, or
  // GoTrue wraps the trigger failure as "Database error saving new
  // user". The CHECK-constraint name is the most specific tell.
  return message.includes('profiles_roles_valid');
}

function mapSupabaseAuthError(err: SupabaseAuthError): AuthError {
  const message = err.message;
  if (isNetworkError(message, err.name)) return new NetworkError(message);
  if (message.includes('User already registered')) {
    return new EmailAlreadyRegisteredError(message);
  }
  if (violatesRolesCheck(message)) return new InvalidRoleError(message);
  return new UnknownAuthError(message);
}

function mapSupabasePostgrestError(err: PostgrestLikeError): AuthError {
  const message = err.message;
  if (isNetworkError(message)) return new NetworkError(message);
  if (violatesRolesCheck(message)) return new InvalidRoleError(message);
  return new UnknownAuthError(message);
}
