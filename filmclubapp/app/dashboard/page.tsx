import { cookies } from 'next/headers';
import Link from 'next/link';

/**
 * User dashboard. In a complete implementation this page would query
 * Supabase using the logged in user's JWT to fetch upcoming meetings and
 * existing RSVPs for the chosen age group. Because this scaffold is meant
 * to be run locally without a database connection, a demo meeting is
 * displayed instead.
 */
export default async function Dashboard({ searchParams }: { searchParams?: { age?: string } }) {
  // The age group is passed from the landing page as a query parameter. In a
  // real application you would persist this on the user record during
  // registration.
  const age = searchParams?.age;

  // Example of where you would retrieve the current user. See /api/auth/me
  // for a server route that can return the user based on a bearer token.
  const cookieStore = cookies();
  const supabaseCookie = cookieStore.get('sb-access-token');
  const isLoggedIn = Boolean(supabaseCookie);

  // TODO: Query Supabase for the upcoming meeting for this age group and the
  // user's RSVP status. For now we return a dummy meeting.
  const upcoming = [
    {
      id: 'demo1',
      film_title: 'Cinema Paradiso',
      starts_at: '2025-09-01T17:00:00Z',
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">המפגש הקרוב שלי</h2>
      {upcoming.map((m) => (
        <div key={m.id} className="rounded-2xl bg-white shadow p-4 flex flex-col gap-1">
          <div className="font-semibold">{m.film_title}</div>
          <div className="text-sm opacity-80">
            {new Date(m.starts_at).toLocaleString('he-IL', { dateStyle: 'medium', timeStyle: 'short' })}
          </div>
          <Link
            href={`/meetings/${m.id}`}
            className="inline-flex mt-2 px-4 py-2 rounded-xl bg-black text-white w-max"
          >
            לפרטים ו־RSVP
          </Link>
        </div>
      ))}
      {!isLoggedIn && (
        <p className="text-sm opacity-70">
          כדי לראות את מצב ה־RSVP וההצבעות שלך, יש להתחבר. <Link href="/login" className="underline">התחברות</Link>
        </p>
      )}
    </div>
  );
}