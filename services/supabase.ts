// URL polyfill is imported for its side effect: supabase-js uses the
// global URL constructor, which Hermes does not fully implement. The
// import must precede createClient — register it at the very top so
// anything imported later (including the Supabase SDK) sees a working
// URL.
import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

// Fail-loud at import time if either var is missing / empty. Silent
// client construction with undefined values ships a broken app to
// JS bundle analysis rather than to crash logs. Typos in .env.local
// should surface as a clear error on first reload, not as a mystery
// "auth failed" after sign-in.
if (!supabaseUrl) {
  throw new Error(
    'EXPO_PUBLIC_SUPABASE_URL is missing or empty. Copy .env.example to .env.local and set the project URL.',
  );
}
if (!supabasePublishableKey) {
  throw new Error(
    'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing or empty. Copy .env.example to .env.local and set the publishable key.',
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // RN has no browser URL; disable the session-from-URL flow that
    // supabase-js defaults on for web.
    detectSessionInUrl: false,
  },
});
