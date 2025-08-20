"use client";
import Link from 'next/link';

type Props = { title: string; description: string; age: string };

/**
 * A simple card component used on the landing page to represent each age track.
 */
export default function ClubCard({ title, description, age }: Props) {
  return (
    <div className="rounded-2xl shadow p-6 bg-white flex flex-col gap-2">
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-sm opacity-80">{description}</p>
      <Link
        href={`/dashboard?age=${encodeURIComponent(age)}`}
        className="mt-3 inline-flex items-center justify-center rounded-xl px-4 py-2 bg-black text-white"
      >
        הצטרפות
      </Link>
    </div>
  );
}