"use client";
import { useEffect, useState } from 'react';

/**
 * Simple admin dashboard for creating meetings. An admin token must be
 * provided (stored in localStorage as `admin_token`) to authorize POST
 * requests. This page is intentionally basic and should be replaced with
 * proper authentication and validation for production use.
 */
export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [form, setForm] = useState({
    club_id: '',
    film_id: '',
    starts_at: '',
    capacity: 100,
    zoom_url: '',
    agenda: '',
  });

  useEffect(() => {
    const envToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN || process.env.ADMIN_TOKEN;
    if (envToken) {
      setToken(envToken);
    } else {
      const stored = localStorage.getItem('admin_token');
      if (stored) setToken(stored);
    }
  }, []);

  useEffect(() => {
    async function fetchMeetings() {
      const res = await fetch('/api/meetings');
      const data = await res.json();
      setMeetings(data);
    }
    fetchMeetings();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function saveToken() {
    if (token) {
      localStorage.setItem('admin_token', token);
    }
  }

  async function createMeeting(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      alert('נא להזין טוקן אדמין');
      return;
    }
    const res = await fetch('/api/meetings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        club_id: form.club_id,
        film_id: form.film_id,
        starts_at: form.starts_at,
        capacity: Number(form.capacity),
        zoom_url: form.zoom_url,
        agenda: form.agenda,
      }),
    });
    if (res.ok) {
      alert('מפגש נוצר בהצלחה');
    } else {
      const data = await res.json();
      alert(data.error || 'שגיאה ביצירת מפגש');
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Admin</h1>
      {!token && (
        <div className="flex flex-col gap-2">
          <label className="flex flex-col gap-1">
            <span>Admin Token</span>
            <input
              type="password"
              value={token || ''}
              onChange={(e) => setToken(e.target.value)}
              className="border rounded px-3 py-2"
            />
          </label>
          <button onClick={saveToken} className="px-4 py-2 rounded bg-black text-white w-max">
            שמור טוקן
          </button>
        </div>
      )}
      {token && (
        <>
          <form onSubmit={createMeeting} className="flex flex-col gap-3 p-4 bg-white shadow rounded">
            <h2 className="text-xl font-semibold">צור מפגש חדש</h2>
            <label className="flex flex-col gap-1">
              <span>Club ID</span>
              <input
                name="club_id"
                value={form.club_id}
                onChange={handleChange}
                className="border rounded px-3 py-2"
                required
              />
            </label>
            <label className="flex flex-col gap-1">
              <span>Film ID</span>
              <input
                name="film_id"
                value={form.film_id}
                onChange={handleChange}
                className="border rounded px-3 py-2"
                required
              />
            </label>
            <label className="flex flex-col gap-1">
              <span>Start Time (ISO)</span>
              <input
                name="starts_at"
                value={form.starts_at}
                onChange={handleChange}
                className="border rounded px-3 py-2"
                type="datetime-local"
                required
              />
            </label>
            <label className="flex flex-col gap-1">
              <span>Capacity</span>
              <input
                name="capacity"
                type="number"
                value={form.capacity}
                onChange={handleChange}
                className="border rounded px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span>Zoom URL</span>
              <input
                name="zoom_url"
                value={form.zoom_url}
                onChange={handleChange}
                className="border rounded px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span>Agenda</span>
              <textarea
                name="agenda"
                value={form.agenda}
                onChange={handleChange}
                className="border rounded px-3 py-2"
              />
            </label>
            <button type="submit" className="px-4 py-2 rounded bg-black text-white w-max">
              צור מפגש
            </button>
          </form>
          <div>
            <h2 className="text-xl font-semibold mt-6 mb-2">מפגשים קיימים</h2>
            <ul className="space-y-2">
              {meetings.map((m) => (
                <li key={m.id} className="p-2 bg-gray-100 rounded">
                  {m.id} – {m.films?.title || ''} ({new Date(m.starts_at_tz).toLocaleString('he-IL')})
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}