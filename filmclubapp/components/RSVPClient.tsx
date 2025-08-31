"use client";
import { useState } from 'react';
import { getClient } from '@/lib/supabase';

/**
 * Authenticated RSVP component. Pulls the user's access token from Supabase
 * auth and sends it along with the RSVP. Displays the current RSVP state
 * after posting.
 */
export default function RSVPClient({ meetingId, initialStatus }: { meetingId: string; initialStatus?: string | null }) {
  const [state, setState] = useState<string | null>(initialStatus ?? null);
  const [loading, setLoading] = useState(false);

  async function send(status: 'yes' | 'maybe' | 'no') {
    setLoading(true);
    const supabase = getClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;
    const res = await fetch('/api/rsvp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({ meeting_id: meetingId, status }),
    });
    const data = await res.json();
    setState(data.status);
    setLoading(false);
  }
  return (
    <div className="flex gap-2 flex-wrap items-center">
      <button
        disabled={loading}
        onClick={() => send('yes')}
        className="px-4 py-2 rounded-xl bg-green-600 text-white"
      >
        מגיע/ה
      </button>
      <button
        disabled={loading}
        onClick={() => send('maybe')}
        className="px-4 py-2 rounded-xl bg-yellow-500 text-white"
      >
        אולי
      </button>
      <button
        disabled={loading}
        onClick={() => send('no')}
        className="px-4 py-2 rounded-xl bg-gray-300"
      >
        לא מגיע/ה
      </button>
      {state && !loading && <span className="ms-2 text-sm">סטטוס: {state}</span>}
    </div>
  );
}
