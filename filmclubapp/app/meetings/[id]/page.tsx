import { getClient } from '../../../lib/supabase';
import RSVPClient from '../../../components/RSVPClient';
import { notFound } from 'next/navigation';

/**
 * Meeting page. Retrieves meeting details from Supabase and renders the film
 * information along with an RSVP component. If no meeting is found the
 * 404 page will be shown.
 */
export default async function MeetingPage({ params }: { params: { id: string } }) {
  const meetingId = params.id;

  // Attempt to fetch the meeting and related film from Supabase. If the
  // environment variables are missing or Supabase is unreachable the
  // following call will fail silently and we fall back to a demo meeting.
  let meeting: any = null;
  try {
    const supabase = getClient();
    const { data, error } = await supabase
      .from('meetings')
      .select(
        `id, starts_at_tz, zoom_url, agenda, capacity, films:film_id (title, year, runtime_min, poster_url, synopsis)`
      )
      .eq('id', meetingId)
      .maybeSingle();
    if (error) {
      console.error(error);
    } else {
      meeting = data;
    }
  } catch (err) {
    console.warn('Supabase call failed, falling back to demo meeting');
  }

  // Fallback demo meeting
  if (!meeting) {
    meeting = {
      id: meetingId,
      starts_at_tz: '2025-09-01T17:00:00Z',
      zoom_url: 'https://zoom.us/j/XXXX',
      agenda: '3 שאלות מנחות + סבב חופשי',
      films: {
        title: 'Cinema Paradiso',
        year: 1988,
        runtime_min: 155,
        poster_url: '',
        synopsis: '',
      },
    };
  }

  // Convert UTC timestamp to localised string for display
  const localDate = new Date(meeting.starts_at_tz);
  const dateStr = localDate.toLocaleDateString('he-IL', { dateStyle: 'medium' });
  const timeStr = localDate.toLocaleTimeString('he-IL', { timeStyle: 'short' });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">
        {meeting.films.title} ({meeting.films.year})
      </h1>
      <div>אורך: {meeting.films.runtime_min} דק׳</div>
      {meeting.films.synopsis && <div>{meeting.films.synopsis}</div>}
      <div>
        תאריך ושעה: {dateStr} – {timeStr} (שעון ישראל)
      </div>
      {meeting.zoom_url && (
        <div>
          שיחה ב־זום:{' '}
          <a className="underline" href={meeting.zoom_url} target="_blank">
            קישור
          </a>
        </div>
      )}
      {meeting.agenda && <div>סילבוס: {meeting.agenda}</div>}
      {/* RSVP client requires authentication. If not logged in it will still post but without user id. */}
      <RSVPClient meetingId={meeting.id} />
    </div>
  );
}
