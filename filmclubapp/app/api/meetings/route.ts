import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient, supabase as anon } from '@/lib/supabase';

/**
 * GET /api/meetings
 * Returns an array of meetings ordered by starts_at_tz. Supports ?age_group=.
 * Always returns an array, even on errors (then it returns []).
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const ageGroup = url.searchParams.get('age_group');
    let query = anon
      .from('meetings')
      .select('id, film_title, starts_at_tz, timezone, url, age_group')
      .order('starts_at_tz', { ascending: true });
    if (ageGroup) query = query.eq('age_group', ageGroup);
    const { data, error } = await query;
    if (error) return NextResponse.json([]);
    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch {
    return NextResponse.json([]);
  }
}

/**
 * POST /api/meetings (admin only)
 * Body: { film_title, starts_at_tz, timezone, url, age_group }
 */
export async function POST(request: NextRequest) {
  const token = request.headers.get('x-admin-token') || '';
  const adminToken = process.env.ADMIN_TOKEN || '';
  if (!adminToken || token !== adminToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const { film_title, starts_at_tz, timezone, url, age_group } = body || {};
  if (!film_title || !starts_at_tz || !timezone || !age_group) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('meetings')
    .insert({ film_title, starts_at_tz, timezone, url, age_group })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

/**
 * DELETE /api/meetings?id=<id> (admin only)
 */
export async function DELETE(request: NextRequest) {
  const token = request.headers.get('x-admin-token') || '';
  const adminToken = process.env.ADMIN_TOKEN || '';
  if (!adminToken || token !== adminToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const admin = createAdminClient();
  const { error } = await admin.from('meetings').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
