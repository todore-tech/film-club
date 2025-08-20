"use client";
import { useState } from 'react';

/**
 * A lightweight RSVP component that does not require authentication. It posts
 * directly to /api/rsvp. Used in early prototypes or when auth isn't yet
 * wired up. In the full application you should use RSVPClient instead.
 */
export default function RSVPButtons({ meetingId }: { meetingId: string }) {
  const [state, setState] = useState<string | null>(null);
  async function rsvp(status: 'yes' | 'maybe' | 'no') {
    setState('loading');
    const res = await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meeting_id: meetingId, status }),
    });
    const data = await res.json();
    setState(data.status);
  }
  return (
    <div className="flex gap-2 flex-wrap items-center">
      <button
        className="px-4 py-2 rounded-xl bg-green-600 text-white"
        onClick={() => rsvp('yes')}
        disabled={state === 'loading'}
      >
        מגיע/ה
      </button>
      <button
        className="px-4 py-2 rounded-xl bg-yellow-500 text-white"
        onClick={() => rsvp('maybe')}
        disabled={state === 'loading'}
      >
        אולי
      </button>
      <button
        className="px-4 py-2 rounded-xl bg-gray-300"
        onClick={() => rsvp('no')}
        disabled={state === 'loading'}
      >
        לא מגיע/ה
      </button>
      {state && state !== 'loading' && (
        <span className="ms-2 text-sm">סטטוס: {state}</span>
      )}
    </div>
  );
}