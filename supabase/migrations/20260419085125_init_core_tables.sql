-- TT-11 — initial migration for the four core tables
-- Creates profiles, trucks, truck_schedules, follows.
-- RLS policies land separately in TT-12.
-- Auth-signup trigger for profiles lands separately in TT-13.

-- pgcrypto is bundled with Postgres 13+ and provides gen_random_uuid().
create extension if not exists pgcrypto;

-- Shared updated_at trigger — applied to profiles, trucks, truck_schedules.
-- follows has no updated_at column (only insert / delete semantics).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- profiles ---------------------------------------------------------------
-- Extends Supabase Auth (auth.users). Row is inserted by the signup trigger
-- (TT-13); until that lands, insert manually when testing.
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  role          text not null check (role in ('consumer', 'operator')),
  display_name  text,
  avatar_url    text,
  language      text not null default 'en' check (language in ('en', 'fr')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- trucks -----------------------------------------------------------------
-- One truck per operator for MVP. is_active = false during winter pause.
create table public.trucks (
  id                uuid primary key default gen_random_uuid(),
  operator_id       uuid not null references public.profiles (id) on delete cascade,
  name              text not null,
  cuisine_tags      text[] not null default array[]::text[],
  description       text,
  cover_url         text,
  plan              text not null default 'free'
                    check (plan in ('free', 'starter', 'pro', 'festival')),
  is_active         boolean not null default true,
  catering_enabled  boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index trucks_operator_id_idx on public.trucks (operator_id);

create trigger trucks_set_updated_at
  before update on public.trucks
  for each row execute function public.set_updated_at();

-- truck_schedules --------------------------------------------------------
-- Daily location + hours per truck. Realtime-published in a later
-- migration (alongside TT-2 Map screen).
create table public.truck_schedules (
  id              uuid primary key default gen_random_uuid(),
  truck_id        uuid not null references public.trucks (id) on delete cascade,
  date            date not null,
  location_lat    double precision not null,
  location_lng    double precision not null,
  location_label  text not null,
  open_time       time not null,
  close_time      time not null,
  is_recurring    boolean not null default false,
  status          text not null default 'scheduled'
                  check (status in ('scheduled', 'live', 'cancelled')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Per-truck per-day lookup for "what's the schedule for truck X on date Y".
create index truck_schedules_truck_id_date_idx
  on public.truck_schedules (truck_id, date);

-- Cross-truck date lookup for the daily reminder cron (TT-14's future concern).
create index truck_schedules_date_idx on public.truck_schedules (date);

create trigger truck_schedules_set_updated_at
  before update on public.truck_schedules
  for each row execute function public.set_updated_at();

-- follows ----------------------------------------------------------------
-- Composite PK on (consumer_id, truck_id). Per-truck notification toggles.
create table public.follows (
  consumer_id             uuid not null references public.profiles (id) on delete cascade,
  truck_id                uuid not null references public.trucks (id) on delete cascade,
  notify_open             boolean not null default true,
  notify_location_change  boolean not null default true,
  notify_special          boolean not null default true,
  created_at              timestamptz not null default now(),
  primary key (consumer_id, truck_id)
);

-- Reverse lookup: "who follows this truck" (used by send-notifications TT-14).
create index follows_truck_id_idx on public.follows (truck_id);
