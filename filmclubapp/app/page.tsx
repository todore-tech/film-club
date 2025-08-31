"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Welcome page. Shows Sign Up / Log In for guests,
 * and quick links for logged-in users.
 */
export default function Page() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setLoggedIn(!!session);
    };
    init();
    const { data } = supabase.auth.onAuthStateChange((_evt, session) => {
      setLoggedIn(!!session);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <main className="max-w-3xl mx-auto p-6 flex flex-col gap-6 items-center text-center">
      <h1 className="text-3xl font-extrabold">Welcome to Film Club</h1>
      <p className="opacity-80 max-w-xl">
        Vote together, watch at home, and meet for a thoughtful discussion. Join now and pick your age group on the next screen.
      </p>
      {loggedIn === null ? null : loggedIn ? (
        <div className="flex gap-3 flex-wrap justify-center">
          <Link className="underline" href="/en">Continue to English</Link>
          <Link className="underline" href="/account">Personal Area</Link>
          <Link className="underline" href="/admin">Admin</Link>
        </div>
      ) : (
        <div className="flex gap-3 flex-wrap justify-center">
          <Link className="px-4 py-2 rounded-xl bg-black text-white" href="/login?mode=signup">Sign Up</Link>
          <Link className="px-4 py-2 rounded-xl border border-gray-300" href="/login?mode=login">Log In</Link>
          <Link className="underline" href="/admin">Admin</Link>
        </div>
      )}
    </main>
  );
}
