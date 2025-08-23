// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// IMPORTANT: do NOT throw at import time.
// During Vercel build these may be empty; at runtime they exist.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Public client (safe for browser & server)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client (server-only; use inside API routes/actions)
export function createAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing SUPABASE env vars for admin client.')
  }
  return createClient(supabaseUrl, serviceRoleKey)
}
