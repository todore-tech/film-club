import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient, getClient } from '@/lib/supabase';
import { ALLOWED_AGE_GROUPS, isAgeGroup } from '@/lib/ageGroups';

export const dynamic = 'force-dynamic'

function isAuthorized(req: NextRequest): boolean {
  const adminToken = process.env.ADMIN_TOKEN || ''
  if (!adminToken) return false
  const x = req.headers.get('x-admin-token') || ''
  if (x && x === adminToken) return true
  const auth = req.headers.get('authorization') || req.headers.get('Authorization') || ''
  if (auth.startsWith('Bearer ') && auth.slice(7) === adminToken) return true
  return false
}

/**
 * GET /api/meetings
 * Returns an array of meetings ordered by starts_at_tz. Supports ?age_group=.
 * Always returns an array, even on errors (then it returns []).
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const ageGroup = url.searchParams.get('age_group');
    const filterAge = isAgeGroup(ageGroup) ? ageGroup : null;

    const anon = getClient();
    let query = anon
      .from('meetings')
      .select('id, film_title, starts_at_tz, timezone, url, age_group')
      .order('starts_at_tz', { ascending: true });
    if (filterAge) query = query.eq('age_group', filterAge);

    // First attempt: assume soft-delete fields exist
    let attempt: any = await (query as any)
      .is('deleted_at', null)
      .eq('is_cancelled', false);
    if (attempt.error) {
      // Fallback: without soft-delete filters
      attempt = await (query as any);
    }
    if (attempt.error) return NextResponse.json([], { headers: { 'Cache-Control': 'no-store' } });
    return NextResponse.json(Array.isArray(attempt.data) ? attempt.data : [], {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json([], { headers: { 'Cache-Control': 'no-store' } });
  }
}

/**
 * POST /api/meetings (admin only)
 * Body: { film_title, starts_at_tz, timezone, url, age_group }
 */
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const { film_title, starts_at_tz, timezone, url, age_group } = body || {};
  if (!film_title || !starts_at_tz || !timezone || !age_group) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  if (!isAgeGroup(age_group)) {
    return NextResponse.json({ error: `Invalid age_group. Allowed: ${ALLOWED_AGE_GROUPS.join(', ')}` }, { status: 400 });
  }
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('meetings')
    .insert({ film_title, starts_at_tz, timezone, url, age_group })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201, headers: { 'Cache-Control': 'no-store' } });
}

/**
 * DELETE /api/meetings?id=<id> (admin only)
 */
export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const admin = createAdminClient();
  const { error } = await admin.from('meetings').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
}
