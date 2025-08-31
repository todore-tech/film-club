// lib/supabase.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Lazily create clients to avoid build-time env errors on Vercel.
let cachedPublic: SupabaseClient | null = null

export function getClient(): SupabaseClient {
  if (cachedPublic) return cachedPublic
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  cachedPublic = createClient(url, anon)
  return cachedPublic
}

// Admin client (server-only; use inside API routes/actions)
export function createAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !service) {
    throw new Error('Missing SUPABASE env vars for admin client.')
  }
  return createClient(url, service, { auth: { autoRefreshToken: false, persistSession: false } })
}
