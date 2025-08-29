-- Safe enum creation (won’t error if already exists)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'age_group') then
    create type public.age_group as enum ('15-17','20-40','55+');
  end if;
end$$;

-- If the type already exists with extra values, just ensure our three exist:
alter type public.age_group add value if not exists '15-17';
alter type public.age_group add value if not exists '20-40';
alter type public.age_group add value if not exists '55+';

-- Add column to meetings if missing
alter table if exists public.meetings
  add column if not exists age_group public.age_group;

-- Optional default (uncomment to set)
-- alter table public.meetings alter column age_group set default '20-40';

