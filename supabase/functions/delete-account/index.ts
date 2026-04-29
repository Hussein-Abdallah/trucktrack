// Account-deletion Edge Function (TT-54).
//
// Flow:
// 1. Reject any request without a Bearer JWT.
// 2. Resolve the calling user from that JWT using a per-request client.
// 3. Re-auth: verify the password by signing in to an *ephemeral* anon
//    client. If the password is wrong, this fails fast with no side
//    effect on the caller's existing session.
// 4. Use the service-role admin client to delete the user. FK ON DELETE
//    CASCADE on profiles → trucks → truck_schedules / follows takes
//    care of the rest of the user's data (per migration
//    20260419085125_init_core_tables.sql).
//
// TODO(TT-XX-stripe): when billing is wired, cancel any active Stripe
// subscriptions for operator users before calling admin.deleteUser.
// Today there's no Stripe integration, so deletion is final and
// idempotent.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { corsHeaders } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';

interface DeleteAccountBody {
  password: string;
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonResponse({ error: 'missing_authorization' }, 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  // Per-request user-scoped client — passes the caller's JWT through
  // so getUser() validates it server-side. Uses the publishable key as
  // the apikey because anon REST is fine for the user lookup; the
  // delete itself runs through supabaseAdmin.
  const publishableKey =
    Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !publishableKey) {
    return jsonResponse({ error: 'server_misconfigured' }, 500);
  }

  const supabaseUser = createClient(supabaseUrl, publishableKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: getUserError } = await supabaseUser.auth.getUser();
  if (getUserError || !userData.user) {
    return jsonResponse({ error: 'unauthorized' }, 401);
  }
  const { id: userId, email } = userData.user;
  if (!email) {
    // No email = OAuth-only or anonymous user. Password re-auth doesn't
    // apply; don't accept the request.
    return jsonResponse({ error: 'no_password_credential' }, 400);
  }

  let body: DeleteAccountBody;
  try {
    body = (await req.json()) as DeleteAccountBody;
  } catch {
    return jsonResponse({ error: 'invalid_json' }, 400);
  }
  const password = typeof body.password === 'string' ? body.password : '';
  if (!password) {
    return jsonResponse({ error: 'password_required' }, 400);
  }

  // Ephemeral anon client for re-auth. signInWithPassword on this
  // separate client doesn't disturb the caller's existing session
  // (which was instantiated with their JWT above).
  const supabaseEphemeral = createClient(supabaseUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: passwordError } = await supabaseEphemeral.auth.signInWithPassword({
    email,
    password,
  });
  if (passwordError) {
    // GoTrue rate-limits failed signInWithPassword attempts at the
    // identity level, not the client level — even though we use an
    // ephemeral client, repeated wrong passwords here count toward the
    // user's main-account lockout. Pass the 429 through so the client
    // can route them to password-reset instead of triggering more
    // attempts.
    const status = (passwordError as { status?: number }).status;
    if (status === 429) {
      return jsonResponse({ error: 'rate_limited' }, 429);
    }
    return jsonResponse({ error: 'invalid_password' }, 401);
  }

  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (deleteError) {
    console.error('[delete-account] admin.deleteUser failed:', deleteError);
    return jsonResponse({ error: 'delete_failed' }, 500);
  }

  return jsonResponse({ ok: true }, 200);
});
