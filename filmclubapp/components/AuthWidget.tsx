"use client";
import { useEffect, useState } from 'react';
import { getClient } from '../lib/supabase';
import Link from 'next/link';

export default function AuthWidget() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = getClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    load();
    const {
      data: listener,
    } = getClient().auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await getClient().auth.signOut();
  };

  if (loading) return null;
  return (
    <div className="flex items-center gap-4 text-sm">
      {user ? (
        <>
          <span>{user.email}</span>
          <button onClick={signOut} className="underline">
            התנתקות
          </button>
        </>
      ) : (
        <Link href="/login" className="underline">
          התחברות
        </Link>
      )}
    </div>
  );
}
