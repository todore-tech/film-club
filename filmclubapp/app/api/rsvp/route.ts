import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

/**
 * Handles RSVP submissions. Requires a JSON body with meeting_id and status
 * ('yes' | 'maybe' | 'no'). If an Authorization header with a bearer token
 * is provided the user will be looked up via Supabase auth and the RSVP
 * associated with their user id. Otherwise a random id is used so that the
 * RSVP can still be stored anonymously.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { meeting_id: meetingId, status } = body;
  if (!meetingId || !status || !['yes', 'maybe', 'no'].includes(status)) {
    return NextResponse.json({ error: 'Invalid RSVP' }, { status: 400 });
  }
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const supabase = createAdminClient();
  // Resolve user id from token if provided
  let userId: string | null = null;
  if (token) {
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (!userError && userData.user) {
      userId = userData.user.id;
    }
  }
  // Anonymous RSVPs are allowed for the MVP: use a synthetic uuid if no user id
  if (!userId) {
    userId = crypto.randomUUID();
  }
  // Fetch meeting capacity and current YES RSVPs to determine waitlist
  const { data: meeting, error: meetingErr } = await supabase
    .from('meetings')
    .select('capacity')
    .eq('id', meetingId)
    .single();
  if (meetingErr || !meeting) {
    return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
  }
  const capacity: number = meeting.capacity ?? 100;
  const { data: countData, error: countErr } = await supabase
    .from('rsvps')
    .select('id', { count: 'exact', head: false })
    .eq('meeting_id', meetingId)
    .eq('status', 'yes')
    .eq('waitlisted', false);
  if (countErr) {
    return NextResponse.json({ error: countErr.message }, { status: 500 });
  }
  const currentYesCount = countData?.length ?? 0;
  // Determine whether to waitlist this RSVP
  const waitlisted = status === 'yes' && currentYesCount >= capacity;
  // Upsert the RSVP
  const { data: rsvp, error: rsvpErr } = await supabase
    .from('rsvps')
    .upsert([
      {
        meeting_id: meetingId,
        user_id: userId,
        status,
        waitlisted,
      },
    ], { onConflict: 'meeting_id,user_id' })
    .select()
    .single();
  if (rsvpErr) {
    return NextResponse.json({ error: rsvpErr.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, status: rsvp.status, waitlisted: rsvp.waitlisted });
}