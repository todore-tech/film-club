import Link from 'next/link';

/**
 * Language selection page.
 * This page allows visitors to choose between Hebrew and English before entering the site.
 * Each option links to the appropriate language-specific landing page.
 */
export default function Page() {
  return (
    <main className="max-w-3xl mx-auto p-6 flex flex-col gap-8 items-center">
      <h1 className="text-3xl font-extrabold text-center">
        בחרו שפה&nbsp;/&nbsp;Choose your language
      </h1>
      <div className="grid gap-4 sm:grid-cols-2 w-full max-w-md">
        <Link
          href="/he"
          className="rounded-2xl shadow p-6 bg-white flex items-center justify-center text-xl font-bold hover:bg-gray-100"
        >
          עברית
        </Link>
        <Link
          href="/en"
          className="rounded-2xl shadow p-6 bg-white flex items-center justify-center text-xl font-bold hover:bg-gray-100"
        >
          English
        </Link>
      </div>
    </main>
  );
}