"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

/**
 * Login page. Provides a form for magic link sign in and a button for
 * Google OAuth. After sending a magic link a confirmation message is
 * displayed.
 */
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const router = useRouter();

  async function signInWithEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/login`,
      },
    });
    if (error) {
      alert(error.message);
    } else {
      setSent(true);
    }
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/login`,
      },
    });
    if (error) {
      alert(error.message);
    }
  }

  return (
    <div className="flex flex-col gap-4 max-w-sm mx-auto">
      <h1 className="text-2xl font-bold">התחברות</h1>
      {sent ? (
        <p>
          שלחנו אליך קישור כניסה לכתובת {email}. בדוק/י את תיבת המייל ולחץ/י על הקישור כדי להיכנס.
        </p>
      ) : (
        <form onSubmit={signInWithEmail} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm">כתובת מייל</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded px-3 py-2"
              required
            />
          </label>
          <button type="submit" className="px-4 py-2 rounded-xl bg-black text-white">
            שלח/י לי קישור כניסה
          </button>
        </form>
      )}
      <hr className="my-4" />
      <button
        onClick={signInWithGoogle}
        className="px-4 py-2 rounded-xl border border-gray-300"
      >
        התחברות עם גוגל
      </button>
    </div>
  );
}