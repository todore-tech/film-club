"use client";
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ALLOWED_AGE_GROUPS } from '@/lib/ageGroups'

type Meeting = { id: string; film_title: string; starts_at_tz: string; age_group: string }

export default function Page() {
  const [ageGroup, setAgeGroup] = useState<string>('20-40')
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let ok = true
    ;(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/meetings?age_group=${encodeURIComponent(ageGroup)}`, { cache: 'no-store' })
        const data = await res.json()
        if (!ok) return
        setMeetings(Array.isArray(data) ? data : [])
      } finally {
        if (ok) setLoading(false)
      }
    })()
    return () => { ok = false }
  }, [ageGroup])

  const subtitle = useMemo(() => `Showing meetings for ${ageGroup}`, [ageGroup])

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Film Club — English</h1>
      <div className="opacity-70">{subtitle}</div>
      <label className="flex items-center gap-2">
        <span>Age group</span>
        <select className="border rounded px-3 py-2" value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)}>
          {ALLOWED_AGE_GROUPS.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </label>
      {loading && <div>Loading…</div>}
      <ul className="divide-y rounded-xl bg-white shadow">
        {meetings.map((m) => (
          <li key={m.id} className="p-3 flex items-center justify-between">
            <div className="flex flex-col text-sm">
              <span className="font-semibold">{m.film_title}</span>
              <span className="opacity-70">{m.starts_at_tz}</span>
            </div>
            <Link href={`/meetings/${m.id}`} className="px-3 py-1.5 rounded border">RSVP</Link>
          </li>
        ))}
        {!loading && meetings.length === 0 && <li className="p-3 opacity-70">No meetings yet.</li>}
      </ul>
    </div>
  )
}

