// Shared base + cross-service error class.
//
// Each service module (services/auth.ts, services/account.ts,
// services/savedLocations.ts, etc.) defines its own typed errors for
// domain-specific cases (InvalidPasswordError, EmailAlreadyRegisteredError,
// …). NetworkError is the one error every service can throw with
// identical semantics, so consolidating it here means a single
// `instanceof NetworkError` check in callers works regardless of which
// service emitted it. Each service still re-exports it so existing
// import paths (e.g. `import { NetworkError } from '@/services/auth'`)
// keep working.

export abstract class AppError extends Error {
  constructor(message: string) {
    super(message);
    // Keep the class name stable across minification so logs and
    // `err.name === 'NetworkError'` checks survive bundlers.
    this.name = new.target.name;
  }
}

export class NetworkError extends AppError {}

// PostgREST and supabase-js auth errors share these fields when surfaced
// through .from()/.rpc()/.auth.* — narrow type for the mapper helpers.
export interface PostgrestLikeError {
  message: string;
  code?: string;
  name?: string;
}

// Heuristic shared by every service mapper. Substring-matches the two
// React Native fetch failure modes plus supabase-js's
// AuthRetryableFetchError class name.
export function isNetworkError(err: { message?: string; name?: string }): boolean {
  if (err.name === 'AuthRetryableFetchError') return true;
  const message = (err.message ?? '').toLowerCase();
  return message.includes('network request failed') || message.includes('failed to fetch');
}
