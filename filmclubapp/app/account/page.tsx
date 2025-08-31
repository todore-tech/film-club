"use client";
import { useEffect, useState } from 'react';
import { getClient } from '@/lib/supabase';

type Profile = {
  full_name: string | null;
  age_group: string | null;
  phone: string | null;
};

type RSVP = {
  id: string;
  meeting_id: string;
  status: 'yes' | 'maybe' | 'no';
  meetings: { id: string; film_title?: string | null; starts_at_tz?: string | null };
};

export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const supabase = getClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }
      setUserEmail(session.user.email || '');
      // Profile
      const { data: prof } = await supabase
        .from('profiles')
        .select('full_name, age_group, phone')
        .eq('user_id', session.user.id)
        .maybeSingle();
      if (mounted) setProfile(prof ?? null);
      // RSVPs with meeting info
      const { data: rs } = await supabase
        .from('rsvps')
        .select('id, meeting_id, status, meetings!inner(id, film_title, starts_at_tz)')
        .eq('user_id', session.user.id);
      if (mounted) setRsvps(Array.isArray(rs) ? (rs as any) : []);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function updateRsvp(id: string, status: 'yes' | 'maybe' | 'no') {
    setRsvps((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    await getClient().from('rsvps').update({ status }).eq('id', id);
  }

  if (loading) return null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Personal Area</h1>
      <div className="p-4 bg-white rounded-xl shadow">
        <h2 className="font-semibold mb-2">Profile</h2>
        <div className="text-sm">Email: {userEmail}</div>
        {profile ? (
          <>
            <div className="text-sm">Full name: {profile.full_name || '-'}</div>
            <div className="text-sm">Age group: {profile.age_group || '-'}</div>
            <div className="text-sm">Phone: {profile.phone || '-'}</div>
          </>
        ) : (
          <div className="text-sm opacity-70">No profile yet.</div>
        )}
      </div>
      <div className="p-4 bg-white rounded-xl shadow">
        <h2 className="font-semibold mb-2">Your RSVPs</h2>
        <ul className="divide-y">
          {rsvps.map((r) => (
            <li key={r.id} className="py-3 flex items-center justify-between gap-3">
              <div className="text-sm">
                <div className="font-semibold">{r.meetings?.film_title || r.meetings?.id}</div>
                <div className="opacity-70">{r.meetings?.starts_at_tz}</div>
              </div>
              <div className="flex gap-2">
                <button className={`px-3 py-1.5 rounded border ${r.status==='yes'?'bg-green-600 text-white':''}`} onClick={() => updateRsvp(r.id, 'yes')}>Yes</button>
                <button className={`px-3 py-1.5 rounded border ${r.status==='maybe'?'bg-yellow-500 text-white':''}`} onClick={() => updateRsvp(r.id, 'maybe')}>Maybe</button>
                <button className={`px-3 py-1.5 rounded border ${r.status==='no'?'bg-gray-300':''}`} onClick={() => updateRsvp(r.id, 'no')}>No</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
