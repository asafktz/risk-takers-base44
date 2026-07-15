import { createClient } from '@supabase/supabase-js';

// Single browser Supabase client. Persists the admin session and picks up the
// magic-link token from the URL on load.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
);
