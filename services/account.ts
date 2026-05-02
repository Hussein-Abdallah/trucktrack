import { supabase } from '@/services/supabase';

// Typed errors mirroring the services/auth.ts pattern so callers can
// branch on `instanceof InvalidPasswordError` rather than message text.

export abstract class AccountError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidPasswordError extends AccountError {}
export class NetworkError extends AccountError {}
export class RateLimitedError extends AccountError {}
export class UnknownAccountError extends AccountError {}

interface DeleteAccountResponse {
  ok?: boolean;
  error?: string;
}

/**
 * Calls the delete-account Edge Function. The function re-authenticates
 * the caller via password, then performs the admin-level deletion.
 *
 * Throws InvalidPasswordError if the password didn't match, NetworkError
 * on connectivity failure, or UnknownAccountError for other server
 * errors. On success the caller is responsible for clearing the local
 * session (the Edge Function only invalidates server-side state).
 *
 * Implementation note: we call fetch directly rather than supabase.
 * functions.invoke because invoke folds non-2xx into a FunctionsHttpError
 * whose body has to be re-read async, making the error-code branching
 * awkward. fetch gives us the status and parsed body in one shot.
 */
export async function deleteAccount(password: string): Promise<void> {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!supabaseUrl || !publishableKey) {
    throw new UnknownAccountError('Supabase env not configured');
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) {
    // No active session = nothing to delete. Treat as unknown so the
    // screen surfaces a generic error and the user can retry by
    // re-logging-in.
    throw new UnknownAccountError('Not signed in');
  }

  let response: Response;
  try {
    response = await fetch(`${supabaseUrl}/functions/v1/delete-account`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: publishableKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });
  } catch (err) {
    // fetch only throws on network failure (DNS, offline, etc.) — HTTP
    // error responses come back as resolved Response with non-2xx
    // status, handled below.
    const message = err instanceof Error ? err.message : 'fetch failed';
    throw new NetworkError(message);
  }

  let payload: DeleteAccountResponse | null = null;
  try {
    payload = (await response.json()) as DeleteAccountResponse;
  } catch {
    // Body wasn't JSON — fall through and decide based on status only.
  }

  if (response.status === 401 && payload?.error === 'invalid_password') {
    throw new InvalidPasswordError('Password is incorrect');
  }

  // GoTrue's signInWithPassword in the Edge Function counts toward the
  // user's identity-level rate limit. If the user fat-fingers enough to
  // trip it, surface a typed error so the screen can guide them to
  // password reset rather than dumping a generic "unknown" alert.
  if (response.status === 429 || payload?.error === 'rate_limited') {
    throw new RateLimitedError(payload?.error ?? 'rate_limited');
  }

  if (!response.ok || !payload?.ok) {
    throw new UnknownAccountError(payload?.error ?? `HTTP ${response.status}`);
  }
}
