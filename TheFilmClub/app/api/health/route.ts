import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

type EnvReport = {
  NEXT_PUBLIC_SUPABASE_URL: boolean
  NEXT_PUBLIC_SUPABASE_ANON_KEY: boolean
  SUPABASE_SERVICE_ROLE_KEY: boolean
  NEXT_PUBLIC_SITE_URL: boolean
}

type SupabaseReport = {
  ok: boolean
  error?: string
  count?: number
}

export async function GET() {
  const env: EnvReport = {
    NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    NEXT_PUBLIC_SITE_URL: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
  }

  let supabase: SupabaseReport

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  if (!url || !key) {
    supabase = { ok: false, error: 'Missing Supabase env vars' }
  } else {
    try {
      const admin = createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
      const { error, count } = await admin
        .from('meetings')
        .select('id', { count: 'exact', head: true })

      if (error) {
        // If the table is missing in the database
        const missingTable = (error as any)?.code === '42P01' || /relation .* does not exist/i.test(error.message)
        supabase = {
          ok: false,
          error: missingTable ? 'Table "meetings" not found' : error.message,
        }
      } else {
        supabase = { ok: true, count: typeof count === 'number' ? count : 0 }
      }
    } catch (e: any) {
      supabase = { ok: false, error: e?.message || 'Unknown error' }
    }
  }

  return NextResponse.json(
    { env, supabase },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}

