-- Enum types
create type age_group as enum ('15-17','20-40','55+');
create type meeting_status as enum ('draft','announced','done');
create type rsvp_status as enum ('yes','maybe','no');
create type notif_type as enum ('announce','reminder24h','reminder2h','followup');

-- Users
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  age_group age_group,
  parent_consent_text text,
  created_at timestamptz default now()
);

-- Clubs (age tracks)
create table if not exists clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  age_min int not null,
  age_max int not null
);

-- Films catalog
create table if not exists films (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  year int,
  runtime_min int,
  poster_url text,
  synopsis text,
  source_url text,
  created_by uuid references users(id)
);

-- Meetings
create table if not exists meetings (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references clubs(id) not null,
  film_id uuid references films(id),
  starts_at_tz timestamptz not null,
  zoom_url text,
  capacity int default 100,
  agenda text,
  status meeting_status default 'draft'
);

-- RSVPs
create table if not exists rsvps (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid references meetings(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  status rsvp_status not null,
  waitlisted boolean default false,
  created_at timestamptz default now(),
  unique (meeting_id, user_id)
);

-- Polls for choosing the next film
create table if not exists polls (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references clubs(id),
  question text,
  closes_at timestamptz,
  is_active boolean default true
);

create table if not exists poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid references polls(id) on delete cascade,
  film_id uuid references films(id),
  option_text text
);

create table if not exists poll_votes (
  id uuid primary key default gen_random_uuid(),
  option_id uuid references poll_options(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  created_at timestamptz default now(),
  unique (option_id, user_id)
);

-- Notifications queue for scheduled emails
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  meeting_id uuid references meetings(id),
  type notif_type not null,
  scheduled_for timestamptz,
  sent_at timestamptz
);

-- Admins table for privileged users
create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) unique,
  created_at timestamptz default now()
);