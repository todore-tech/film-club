"use client";
import { useState } from 'react';
import { getClient } from '@/lib/supabase';

interface Option {
  id: string;
  option_text: string | null;
  film_title?: string | null;
}
interface Poll {
  id: string;
  question: string | null;
  options: Option[];
}

/**
 * Authenticated poll voting component. Allows a user to select an option and
 * posts the vote to `/api/polls/[poll.id]/vote`. After voting a success
 * message is displayed.
 */
export default function VoteClient({ poll }: { poll: Poll }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function vote(optionId: string) {
    setLoading(true);
    const supabase = getClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;
    const res = await fetch(`/api/polls/${poll.id}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({ option_id: optionId }),
    });
    if (res.ok) {
      setSelected(optionId);
    } else {
      const data = await res.json();
      alert(data.error || 'שגיאה בשליחת ההצבעה');
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-2">
      {poll.options.map((opt) => {
        const label = opt.option_text || opt.film_title || '';
        return (
          <label key={opt.id} className="flex items-center gap-2">
            <input
              type="radio"
              name="vote"
              value={opt.id}
              checked={selected === opt.id}
              onChange={() => vote(opt.id)}
              disabled={loading}
            />
            <span>{label}</span>
          </label>
        );
      })}
      {selected && <p className="text-sm">תודה שהצבעת!</p>}
    </div>
  );
}
