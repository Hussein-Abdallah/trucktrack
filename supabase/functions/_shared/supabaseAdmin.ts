import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Accept either key format so the Edge Function works whether the
// project is wired with the new sb_secret_* key (via
// `supabase secrets set SUPABASE_SECRET_KEY=...`) or relying on the
// Supabase runtime's auto-injected legacy SUPABASE_SERVICE_ROLE_KEY.
// Prefer the new format when both are set.
const supabaseUrl = Deno.env.get('SUPABASE_URL');
// Use || (not ??) so empty / whitespace-only values also fall through
// to the legacy auto-injected key — an operator who blanks the new
// var by mistake keeps a working Edge Function.
const trimmedPrimary = (Deno.env.get('SUPABASE_SECRET_KEY') ?? '').trim();
const secretKey = trimmedPrimary || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !secretKey) {
  throw new Error(
    'Missing required environment variables: SUPABASE_URL and either SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY',
  );
}

export const supabaseAdmin = createClient(supabaseUrl, secretKey);
