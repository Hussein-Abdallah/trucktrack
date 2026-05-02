-- TT-55 — operator_saved_locations table
--
-- Operator-side store of frequently-used spots so the Today screen
-- (TT-56) can publish in two taps: tap a saved-location chip → tap
-- PUBLISH. Each saved location carries default open/close hours so
-- publishing pulls those into the new truck_schedules row without an
-- inline picker.
--
-- Owner-only RLS — the consumer side never reads these rows; only the
-- operator who owns them. Uniform predicate across actions, so a single
-- FOR ALL policy mirrors the follows_owner_all shape from TT-12.

create table public.operator_saved_locations (
  id                  uuid primary key default gen_random_uuid(),
  operator_id         uuid not null references public.profiles (id) on delete cascade,
  name                text not null check (char_length(name) between 1 and 80),
  location_label      text not null check (char_length(location_label) between 1 and 200),
  location_lat        double precision not null check (location_lat between -90 and 90),
  location_lng        double precision not null check (location_lng between -180 and 180),
  default_open_time   time not null,
  default_close_time  time not null,
  display_order       int not null default 0,
  created_at          timestamptz not null default now(),
  -- Overnight hours not in scope for chip-grid MVP — operator with
  -- truly variable hours uses the Schedule screen (TT-8) to override.
  constraint operator_saved_locations_hours_ordered
    check (default_open_time < default_close_time)
);

-- Per-operator chip-grid render order. Composite key keeps the index
-- useful both for the WHERE-by-operator filter and the ORDER BY.
create index operator_saved_locations_operator_id_display_order_idx
  on public.operator_saved_locations (operator_id, display_order);

alter table public.operator_saved_locations enable row level security;

-- Owner-only — uniform predicate across SELECT/INSERT/UPDATE/DELETE.
-- Anon role receives no policies; deny-by-default keeps the table
-- invisible to unauthenticated requests without a separate policy.
create policy operator_saved_locations_owner_all
  on public.operator_saved_locations
  for all to authenticated
  using (operator_id = auth.uid())
  with check (operator_id = auth.uid());
