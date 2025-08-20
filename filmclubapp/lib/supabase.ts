import { createClient, SupabaseClient } from '@supabase/supabase-js';

/*
 * This module exports both a browser‑side client (using the public anon key) and
 * a helper to create a service role client (for server routes). The anon client
 * persists sessions automatically in local storage; the server client should
 * never be used on the client because it can bypass RLS.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser/client side client. Uses the anon key and persists session.
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

/**
 * Create a Supabase client using the service role key. Only safe on the server.
 * Throws if SUPABASE_SERVICE_ROLE_KEY is not defined.
 */
export function createAdminClient(): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY must be set to use createAdminClient');
  }
  return createClient(supabaseUrl, serviceKey);
}