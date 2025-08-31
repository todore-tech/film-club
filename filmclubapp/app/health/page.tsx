"use client"

import { useCallback, useEffect, useState } from 'react'

type HealthResponse = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: boolean
    NEXT_PUBLIC_SUPABASE_ANON_KEY: boolean
    SUPABASE_SERVICE_ROLE_KEY: boolean
    NEXT_PUBLIC_SITE_URL: boolean
  }
  supabase: {
    ok: boolean
    error?: string
    count?: number
  }
}

export default function HealthPage() {
  const [data, setData] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/health', { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = (await res.json()) as HealthResponse
      setData(json)
    } catch (e: any) {
      setError(e?.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const EnvRow = ({ label, ok }: { label: string; ok: boolean }) => (
    <li className="flex items-center justify-between py-1">
      <span className="text-sm text-gray-700">{label}</span>
      <span className={ok ? 'text-green-600' : 'text-red-600'}>{ok ? '✅' : '❌'}</span>
    </li>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Health Check</h1>
        <button
          className="rounded bg-black text-white text-sm px-3 py-1 disabled:opacity-50"
          onClick={load}
          disabled={loading}
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <section className="border rounded p-4">
        <h2 className="font-medium mb-2">Environment</h2>
        <ul>
          <EnvRow label="NEXT_PUBLIC_SUPABASE_URL" ok={!!data?.env.NEXT_PUBLIC_SUPABASE_URL} />
          <EnvRow label="NEXT_PUBLIC_SUPABASE_ANON_KEY" ok={!!data?.env.NEXT_PUBLIC_SUPABASE_ANON_KEY} />
          <EnvRow label="SUPABASE_SERVICE_ROLE_KEY" ok={!!data?.env.SUPABASE_SERVICE_ROLE_KEY} />
          <EnvRow label="NEXT_PUBLIC_SITE_URL" ok={!!data?.env.NEXT_PUBLIC_SITE_URL} />
        </ul>
      </section>

      <section className="border rounded p-4">
        <h2 className="font-medium mb-2">Supabase</h2>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Connection + meetings table</span>
          <span className={data?.supabase.ok ? 'text-green-600' : 'text-red-600'}>
            {data?.supabase.ok ? '✅' : '❌'}
          </span>
        </div>
        {data?.supabase.ok && (
          <div className="text-sm text-gray-700 mt-2">meetings count: {data?.supabase.count ?? 0}</div>
        )}
        {!data?.supabase.ok && data?.supabase.error && (
          <div className="text-sm text-red-600 mt-2">{data.supabase.error}</div>
        )}
      </section>
    </div>
  )
}

