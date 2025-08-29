"use client";
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Meeting = {
  id: string;
  film_title: string;
  starts_at_tz: string;
  timezone?: string | null;
  url?: string | null;
  age_group: string;
};

const AGE_GROUPS = ['7-10', '11-14', '15-17', '18-29', '30-60', '60+'] as const;

export default function Page() {
  const [ageGroup, setAgeGroup] = useState<string>('18-29');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const url = `/api/meetings?age_group=${encodeURIComponent(ageGroup)}`;
      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();
      setMeetings(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ageGroup]);

  const subtitle = useMemo(
    () => `Showing meetings for age group: ${ageGroup}`,
    [ageGroup]
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-extrabold">Film Club — Vote, Watch, Discuss</h1>
      <p className="opacity-80">{subtitle}</p>
      <label className="flex items-center gap-2">
        <span>Age group</span>
        <select
          value={ageGroup}
          onChange={(e) => setAgeGroup(e.target.value)}
          className="border rounded px-3 py-2"
        >
          {AGE_GROUPS.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </label>
      <div className="flex flex-col gap-2">
        {loading && <div>Loading…</div>}
        {!loading && meetings.length === 0 && (
          <div className="opacity-70">No meetings for this group yet.</div>
        )}
        <ul className="divide-y rounded-xl bg-white shadow">
          {meetings.map((m) => (
            <li key={m.id} className="p-3 flex items-center justify-between gap-3">
              <div className="flex flex-col text-sm">
                <span className="font-semibold">{m.film_title}</span>
                <span className="opacity-70">{m.starts_at_tz}</span>
              </div>
              <Link href={`/meetings/${m.id}`} className="px-3 py-1.5 rounded border">RSVP</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
