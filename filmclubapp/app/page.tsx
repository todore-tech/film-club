'use client';
import { useState, FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

/**
 * Home page with login / sign-up form.
 * After successful authentication user is redirected to /language.
 */
export default function HomePage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !password) return;
    let authError;
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      authError = error;
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      authError = error;
    }
    if (authError) {
      setError(authError.message);
    } else {
      router.push('/language');
    }
  }

  return (
    <div className="flex flex-col gap-4 max-w-sm mx-auto">
      <h1 className="text-2xl font-bold">{isSignUp ? 'Sign Up' : 'Log In'}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
        <label className="flex flex-col gap-1">
          <span className="text-sm">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded px-3 py-2"
            required
          />
        </label>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="px-4 py-2 rounded-xl bg-black text-white">
          {isSignUp ? 'Sign Up' : 'Log In'}
        </button>
      </form>
      <button
        onClick={() => setIsSignUp((p) => !p)}
        className="text-sm text-blue-600 underline"
      >
        {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
      </button>
    </div>
  );
}
