import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

/**
 * Handles voting in a poll. Expects the poll id in the route param and a
 * JSON body with `option_id`. Requires a bearer token for the user. The
 * endpoint will remove any existing votes by the user in the poll before
 * inserting the new vote.
 */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const pollId = params.id;
  const { option_id: optionId } = await request.json().catch(() => ({}));
  if (!optionId) {
    return NextResponse.json({ error: 'Missing option_id' }, { status: 400 });
  }
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = createAdminClient();
  // Get user from token
  const { data: userData, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !userData.user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
  const userId = userData.user.id;
  // Verify that the option belongs to the poll
  const { data: option, error: optErr } = await supabase
    .from('poll_options')
    .select('id, poll_id')
    .eq('id', optionId)
    .single();
  if (optErr || !option || option.poll_id !== pollId) {
    return NextResponse.json({ error: 'Invalid option for this poll' }, { status: 400 });
  }
  // Remove any existing vote by the user in this poll
  const { error: delErr } = await supabase
    .from('poll_votes')
    .delete()
    .in(
      'option_id',
      (await supabase
        .from('poll_options')
        .select('id')
        .eq('poll_id', pollId))
        .data?.map((o: any) => o.id) || []
    )
    .eq('user_id', userId);
  if (delErr) {
    return NextResponse.json({ error: delErr.message }, { status: 500 });
  }
  // Insert the new vote
  const { data: vote, error: insErr } = await supabase
    .from('poll_votes')
    .insert({ option_id: optionId, user_id: userId })
    .select()
    .single();
  if (insErr) {
    return NextResponse.json({ error: insErr.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, vote });
}