"use client";
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getClient } from '@/lib/supabase'

export default function Page() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)
  useEffect(() => {
    const run = async () => {
      const supabase = getClient()
      const { data: { session } } = await supabase.auth.getSession()
      setLoggedIn(!!session)
    }
    run()
    const sub = getClient().auth.onAuthStateChange((_e, s) => setLoggedIn(!!s))
    return () => sub.data.subscription.unsubscribe()
  }, [])

  return (
    <div className="flex flex-col gap-4 items-center text-center">
      <h1 className="text-3xl font-extrabold">Welcome to The Film Club</h1>
      <p className="opacity-80 max-w-xl">Vote together, watch at home, and meet for discussion.</p>
      {loggedIn ? (
        <div className="flex gap-3 flex-wrap justify-center">
          <Link className="underline" href="/en">English Page</Link>
          <Link className="underline" href="/admin">Admin</Link>
        </div>
      ) : (
        <div className="flex gap-3 flex-wrap justify-center">
          <Link className="px-4 py-2 rounded-xl bg-black text-white" href="/login?mode=signup">Sign Up</Link>
          <Link className="px-4 py-2 rounded-xl border" href="/login?mode=login">Log In</Link>
          <Link className="underline" href="/admin">Admin</Link>
        </div>
      )}
    </div>
  )
}
