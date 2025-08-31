import { NextRequest, NextResponse } from 'next/server'
import { getClient, createAdminClient } from '@/lib/supabase'
import { ALLOWED_AGE_GROUPS, isAgeGroup } from '@/lib/ageGroups'

export const dynamic = 'force-dynamic'

function isAuthorized(req: NextRequest) {
  const adminToken = process.env.ADMIN_TOKEN || ''
  if (!adminToken) return false
  const x = req.headers.get('x-admin-token') || ''
  if (x && x === adminToken) return true
  const auth = req.headers.get('authorization') || req.headers.get('Authorization') || ''
  if (auth.startsWith('Bearer ') && auth.slice(7) === adminToken) return true
  return false
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const age = url.searchParams.get('age_group')
    const filterAge = isAgeGroup(age) ? age : null

    const anon = getClient()
    let query = anon
      .from('meetings')
      .select('id, film_title, starts_at_tz, timezone, url, age_group')
      .order('starts_at_tz', { ascending: true })

    if (filterAge) query = query.eq('age_group', filterAge)

    const { data, error } = await query
    if (error) return NextResponse.json([], { headers: { 'Cache-Control': 'no-store' } })
    return NextResponse.json(Array.isArray(data) ? data : [], { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json([], { headers: { 'Cache-Control': 'no-store' } })
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => ({} as any))
  const { film_title, starts_at_tz, timezone, url, age_group } = body || {}
  if (!film_title || !starts_at_tz || !timezone || !age_group) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  if (!isAgeGroup(age_group)) return NextResponse.json({ error: `Invalid age_group. Allowed: ${ALLOWED_AGE_GROUPS.join(', ')}` }, { status: 400 })
  const admin = createAdminClient()
  const { data, error } = await admin.from('meetings').insert({ film_title, starts_at_tz, timezone, url, age_group }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201, headers: { 'Cache-Control': 'no-store' } })
}

export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const admin = createAdminClient()
  const { error } = await admin.from('meetings').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
}
