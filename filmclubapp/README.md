# Film Club – Next.js + Supabase

This repository contains a ready‑to‑use scaffold for a film club web
application. It implements the core features required for a minimum viable
product (MVP): registration by age group, upcoming meetings with RSVP,
polls for selecting the next film, and basic email notifications. The
project is built with Next.js 14 (App Router), TypeScript and Tailwind
CSS, and uses Supabase (Postgres + Auth) as the backend. Resend is used
for sending transactional emails.

## Features

* Landing page with three age tracks (15–17, 20–40, 55+).
* User dashboard showing the upcoming meeting and allowing RSVP.
* Meeting page displaying film details and providing RSVP buttons.
* Polls for choosing the next film, with authenticated voting.
* Admin dashboard (MVP) for creating meetings.
* Email templates for announcement, 24h and 2h reminders and follow‑ups.
* Utility functions for generating iCalendar invites and sending emails.

## Quick start

Follow these steps to set up the project locally. Note that internet
access is disabled in this environment so `npm install` must be run on
your own machine after cloning.

1. **Create the Next.js project structure.** This repository already
   contains the full directory tree under `filmclub/`. If you are
   starting from scratch, run:
   ```bash
   npx create-next-app@latest filmclub \
     --ts --eslint --tailwind --app --src-dir --import-alias "@/*"
   cd filmclub
   ```
   Then copy the contents of this repository into the generated
   directory.

2. **Install dependencies.** After cloning, run:
   ```bash
   npm install
   ```
   This installs Next.js, React, Supabase, Tailwind, Resend and other
   required packages.

3. **Create a Supabase project.** Go to [supabase.com](https://supabase.com) and
   create a new project. In the SQL editor paste the contents of
   `supabase/schema.sql` to set up the database schema. Enable the
   **Email** (and optionally **Google**) provider under
   Authentication → Providers.

4. **Configure environment variables.** Copy `.env.example` to
   `.env.local` and fill in the values:
   * `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from
     your Supabase project settings.
   * `SUPABASE_SERVICE_ROLE_KEY` from the *Project API keys* page (used
     on the server only – keep this secret).
   * `RESEND_API_KEY` from your Resend account (or replace with
     SendGrid if preferred).
   * `ADMIN_TOKEN` – an arbitrary string used to protect the admin page.

5. **Run the development server.**
   ```bash
   npm run dev
   ```
   Visit [http://localhost:3000](http://localhost:3000) to view the
   application. Use `/login` to sign in with email or Google.

6. **Admin dashboard.** Navigate to `/admin`, enter the `ADMIN_TOKEN`
   you set in your `.env.local` file and create new meetings.

## Email notifications

Email templates live under `emails/`. The helper functions in
`lib/emailTemplates.ts` fill the placeholders for you. The
`lib/mailer.ts` module wraps the Resend client. To preview a message
without sending a real notification schedule, POST to
`/api/notifications/preview` with a JSON body like:

```json
{
  "to": "you@example.com",
  "type": "announce",
  "meeting": {
    "film_title": "Cinema Paradiso",
    "start": "2025-09-01T17:00:00Z",
    "end": "2025-09-01T19:30:00Z",
    "url": "http://localhost:3000/meetings/demo1"
  }
}
```

On production you should implement scheduled cron jobs (e.g. with
Supabase edge functions or Vercel Cron) to enqueue notifications into
the `notifications` table and call the mailer at appropriate times.

## Auth

This scaffold includes magic link and Google sign‑in via Supabase.
Authenticated pages and API routes extract the bearer token from the
`Authorization` header and look up the user via Supabase's admin API.

## Admin notes

The admin page in this scaffold is intentionally simple and uses a
shared token for authorization. For production use you should replace
this with a proper admin login flow and restrict access via Supabase
Row Level Security (RLS).