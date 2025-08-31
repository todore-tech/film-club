"use client";
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ALLOWED_AGE_GROUPS } from '@/lib/ageGroups'

export default function AdminPage() {
  const [token, setToken] = useState('')
  const [authed, setAuthed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [meetings, setMeetings] = useState<any[]>([])
  const [form, setForm] = useState({ film_title: '', date: '', time: '', timezone: 'Asia/Jerusalem', url: '', age_group: '20-40' })

  useEffect(() => {
    const stored = localStorage.getItem('ADMIN_TOKEN') || ''
    if (stored) { setToken(stored); setAuthed(true) }
  }, [])

  const headers = useMemo(() => ({ 'Content-Type': 'application/json', 'x-admin-token': token }), [token])

  const fetchMeetings = useCallback(async () => {
    setBusy(true)
    try {
      const res = await fetch('/api/meetings', { cache: 'no-store' })
      const data = await res.json()
      setMeetings(Array.isArray(data) ? data : [])
    } finally { setBusy(false) }
  }, [])

  useEffect(() => { fetchMeetings() }, [fetchMeetings])

  function saveToken() { localStorage.setItem('ADMIN_TOKEN', token); setAuthed(true) }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  async function createMeeting(e: React.FormEvent) {
    e.preventDefault()
    if (!authed || !token) return alert('Enter admin token')
    const starts_at_tz = new Date(`${form.date}T${form.time}:00`).toISOString()
    const res = await fetch('/api/meetings', { method: 'POST', headers, body: JSON.stringify({
      film_title: form.film_title, starts_at_tz, timezone: form.timezone, url: form.url || null, age_group: form.age_group,
    }) })
    if (!res.ok) { const data = await res.json().catch(() => ({})); return alert(data.error || 'Failed to create') }
    setForm({ film_title: '', date: '', time: '', timezone: 'Asia/Jerusalem', url: '', age_group: '20-40' }); fetchMeetings()
  }

  async function removeMeeting(id: string) {
    if (!authed || !token) return alert('Enter admin token')
    if (!confirm('Delete this meeting?')) return
    await fetch(`/api/meetings?id=${encodeURIComponent(id)}`, { method: 'DELETE', headers })
    fetchMeetings()
  }

  return (
    <div dir="rtl" className="flex flex-col gap-6 max-w-2xl text-right">
      <h1 className="text-2xl font-bold">Admin</h1>
      {!authed && (
        <div className="flex flex-col gap-2">
          <label className="flex flex-col gap-1">
            <span>Admin Token</span>
            <input type="password" value={token} onChange={(e) => setToken(e.target.value)} className="border rounded px-3 py-2" />
          </label>
          <button onClick={saveToken} className="px-4 py-2 rounded bg-black text-white w-max">Save Token</button>
        </div>
      )}
      {authed && (
        <>
          <form onSubmit={createMeeting} className="flex flex-col gap-3 p-4 bg-white shadow rounded">
            <h2 className="text-xl font-semibold">Create a Meeting</h2>
            <label className="flex flex-col gap-1">
              <span>Film Title</span>
              <input name="film_title" value={form.film_title} onChange={handleChange} className="border rounded px-3 py-2" required />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1"><span>Date</span><input type="date" name="date" value={form.date} onChange={handleChange} className="border rounded px-3 py-2" required /></label>
              <label className="flex flex-col gap-1"><span>Time</span><input type="time" name="time" value={form.time} onChange={handleChange} className="border rounded px-3 py-2" required /></label>
            </div>
            <label className="flex flex-col gap-1"><span>Timezone</span><input name="timezone" value={form.timezone} onChange={handleChange} className="border rounded px-3 py-2" /></label>
            <label className="flex flex-col gap-1"><span>Meeting Link (optional)</span><input name="url" value={form.url} onChange={handleChange} className="border rounded px-3 py-2" /></label>
            <label className="flex flex-col gap-1">
              <span>Age Group</span>
              <select name="age_group" value={form.age_group} onChange={handleChange} className="border rounded px-3 py-2">
                {ALLOWED_AGE_GROUPS.map((g) => (<option key={g} value={g}>{g}</option>))}
              </select>
            </label>
            <button type="submit" className="px-4 py-2 rounded bg-black text-white w-max">Create</button>
          </form>
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold">Meetings</h2>
            <ul className="divide-y rounded-xl bg-white shadow">
              {(Array.isArray(meetings) ? meetings : []).map((m) => (
                <li key={m.id} className="p-3 flex items-center justify-between gap-3">
                  <div className="flex flex-col text-sm">
                    <span className="font-semibold">{m.film_title}</span>
                    <span className="opacity-70">{m.starts_at_tz} · {m.age_group}</span>
                  </div>
                  <button onClick={() => removeMeeting(m.id)} className="px-3 py-1.5 rounded border">Delete</button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}

