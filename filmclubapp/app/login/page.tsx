"use client";
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Combined Login / Signup page.
 * Mode controlled via ?mode=signup|login
 * Signup collects profile fields and upserts into `profiles` after login completes.
 */
function LoginInner() {
  const params = useSearchParams();
  const mode = (params.get('mode') || 'login') as 'login' | 'signup';
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [fullName, setFullName] = useState('');
  const [ageGroup, setAgeGroup] = useState('18-29');
  const [phone, setPhone] = useState('');

  // On auth change, if a pending profile exists from signup, upsert it.
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(async (_evt, session) => {
      if (!session) return;
      try {
        const pending = localStorage.getItem('pending_profile');
        if (pending) {
          const parsed = JSON.parse(pending);
          localStorage.removeItem('pending_profile');
          await supabase.from('profiles').upsert({
            user_id: session.user.id,
            full_name: parsed.full_name,
            age_group: parsed.age_group,
            phone: parsed.phone || null,
          });
        }
      } finally {
        router.replace('/en');
      }
    });
    return () => data.subscription.unsubscribe();
  }, [router]);

  const pageTitle = useMemo(() => (mode === 'signup' ? 'Sign Up' : 'Log In'), [mode]);

  const submitEmail = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email) return;

      // If signup, stash profile locally for post-login upsert
      if (mode === 'signup') {
        localStorage.setItem(
          'pending_profile',
          JSON.stringify({ full_name: fullName, age_group: ageGroup, phone })
        );
      }

      const redirect = `${process.env.NEXT_PUBLIC_SITE_URL}/login`;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirect },
      });
      if (error) alert(error.message);
      else setSent(true);
    },
    [email, mode, fullName, ageGroup, phone]
  );

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/en` },
    });
    if (error) alert(error.message);
  }

  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold">{pageTitle}</h1>
      {sent ? (
        <p>
          We sent a login link to {email}. Check your inbox and click the link to continue.
        </p>
      ) : (
        <form onSubmit={submitEmail} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded px-3 py-2"
              required
            />
          </label>
          {mode === 'signup' && (
            <>
              <label className="flex flex-col gap-1">
                <span className="text-sm">Full Name</span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="border rounded px-3 py-2"
                  required
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm">Age Group</span>
                <select
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  className="border rounded px-3 py-2"
                >
                  <option value="7-10">7-10</option>
                  <option value="11-14">11-14</option>
                  <option value="15-17">15-17</option>
                  <option value="18-29">18-29</option>
                  <option value="30-60">30-60</option>
                  <option value="60+">60+</option>
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm">Phone (optional)</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="border rounded px-3 py-2"
                />
              </label>
            </>
          )}
          <button type="submit" className="px-4 py-2 rounded-xl bg-black text-white">
            {mode === 'signup' ? 'Send Sign-Up Link' : 'Send Login Link'}
          </button>
        </form>
      )}
      <hr className="my-4" />
      <button onClick={signInWithGoogle} className="px-4 py-2 rounded-xl border border-gray-300">
        Continue with Google
      </button>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div />}> 
      <LoginInner />
    </Suspense>
  );
}
