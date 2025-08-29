import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

/**
 * GET /api/meetings
 * Optionally accepts `club_id` as a search parameter to filter meetings for a
 * specific club. Returns an array of meetings with minimal film metadata.
 *
 * POST /api/meetings (admin only)
 * Creates a new meeting. Requires an Authorization header with the value
 * `Bearer ${process.env.ADMIN_TOKEN}`. The request body should include
 * club_id, film_id, starts_at (ISO timestamp), capacity, zoom_url and
 * agenda. This endpoint uses the service role key via createAdminClient.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const clubId = url.searchParams.get('club_id');
  const supabase = createAdminClient();
  let query = supabase
    .from('meetings')
    .select('id, club_id, starts_at_tz, status, films:film_id (title)')
    .order('starts_at_tz', { ascending: true });
  if (clubId) {
    query = query.eq('club_id', clubId);
  }
  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const auth = request.headers.get('authorization') || request.headers.get('Authorization');
  const adminToken = process.env.ADMIN_TOKEN || process.env.NEXT_PUBLIC_ADMIN_TOKEN;
  if (!adminToken) {
    return NextResponse.json({ error: 'Server misconfigured: ADMIN_TOKEN not set' }, { status: 500 });
  }
  if (!auth) {
    return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
  }
  if (auth !== `Bearer ${adminToken}`) {
    return NextResponse.json({ error: 'Invalid admin token' }, { status: 403 });
  }
  const body = await request.json();
  const { club_id, film_id, starts_at, capacity = 100, zoom_url, agenda } = body;
  if (!club_id || !film_id || !starts_at) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('meetings')
    .insert({
      club_id,
      film_id,
      starts_at_tz: starts_at,
      capacity,
      zoom_url,
      agenda,
      status: 'announced',
    })
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}