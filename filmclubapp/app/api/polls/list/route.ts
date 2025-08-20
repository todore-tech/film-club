import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

/**
 * Returns the currently active poll (if any) for a given club. Provide
 * `club_id` as a query parameter. The response includes poll options and
 * embedded film titles when available.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const clubId = url.searchParams.get('club_id');
  const supabase = createAdminClient();
  let query = supabase
    .from('polls')
    .select('id, question, poll_options(id, option_text, film_id, films:film_id (title))')
    .eq('is_active', true)
    .order('closes_at', { ascending: true })
    .limit(1);
  if (clubId) {
    query = query.eq('club_id', clubId);
  }
  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const poll = data?.[0] || null;
  if (!poll) {
    return NextResponse.json({ poll: null });
  }
  // Map options to include film_title if provided
  const options = poll.poll_options.map((opt: any) => ({
    id: opt.id,
    option_text: opt.option_text,
    film_title: opt.films?.title || null,
  }));
  return NextResponse.json({ id: poll.id, question: poll.question, options });
}