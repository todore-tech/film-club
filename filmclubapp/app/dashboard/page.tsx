"use client";
import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ALLOWED_AGE_GROUPS, isAgeGroup } from '@/lib/ageGroups';

type Meeting = { id: string; film_title: string; starts_at_tz: string };

function DashboardInner() {
  const params = useSearchParams();
  const ageParam = params.get('age') || '20-40';
  const age = isAgeGroup(ageParam) ? ageParam : '20-40';
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);

  const subtitle = useMemo(() => `מפגשים לקבוצת הגיל ${age}`, [age]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/meetings?age_group=${encodeURIComponent(age)}`, { cache: 'no-store' });
        const data = await res.json();
        if (!alive) return;
        setMeetings(Array.isArray(data) ? data : []);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [age]);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">המפגש הקרוב שלי</h2>
      <div className="opacity-70">{subtitle}</div>
      {loading && <div>טוען…</div>}
      {!loading && meetings.map((m) => (
        <div key={m.id} className="rounded-2xl bg-white shadow p-4 flex flex-col gap-1">
          <div className="font-semibold">{m.film_title}</div>
          <div className="text-sm opacity-80">
            {new Intl.DateTimeFormat('he-IL', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(m.starts_at_tz))}
          </div>
          <Link href={`/meetings/${m.id}`} className="inline-flex mt-2 px-4 py-2 rounded-xl bg-black text-white w-max">
            לפרטים ו־RSVP
          </Link>
        </div>
      ))}
      {!loading && meetings.length === 0 && (
        <div className="opacity-70">אין מפגשים מתאימים כרגע.</div>
      )}
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div />}> 
      <DashboardInner />
    </Suspense>
  );
}
