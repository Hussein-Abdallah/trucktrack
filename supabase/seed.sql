-- TT-41 — dev seed data
-- ====================================================================
-- Purpose: populate a fresh local DB (`npm run db:reset`) with realistic
-- content so every UI surface — open / closed / scheduled / cancelled /
-- paused / no-schedule — renders meaningfully out of the box.
--
-- Loaded automatically by Supabase CLI per supabase/config.toml
-- ([db.seed] sql_paths = ["./seed.sql"]).
--
-- Stable test IDs: every UUID is fixed (a0000000-… for operators,
-- b0000000-… for trucks, c0000000-… for schedules) so test fixtures and
-- manual smokes can reference rows by ID across resets without hunting
-- for newly-generated UUIDs.
--
-- Idempotency: every insert uses ON CONFLICT (id) DO NOTHING so
-- re-running the seed without a reset is a no-op.
--
-- Image licensing: cover_url + avatar_url point at images.unsplash.com.
-- Per the Unsplash License (https://unsplash.com/license), photos are
-- free for commercial + non-commercial use with no attribution required
-- and may be hot-linked. Photo IDs are stable — the /photo-{id} pattern
-- doesn't rot. If a URL ever 404s, swap the ID; the rest of the seed
-- remains valid.
--
-- Date sensitivity: schedules use CURRENT_DATE so `db:reset` next
-- Tuesday still produces "today's" schedules. UI states are kept stable
-- across the 24-hour cycle by combining full-day windows (live-now
-- trucks) with now()-relative offsets (closed-today, scheduled-later).
-- See the schedules section comment block for the wrap-behaviour proof.
-- ====================================================================

-- ---------------------------------------------------------------------
-- 1. Operator auth.users — the TT-13 trigger auto-creates matching
--    public.profiles rows from raw_user_meta_data (role, display_name,
--    language). avatar_url is NOT carried by the trigger; it lands in
--    the UPDATE block below.
-- ---------------------------------------------------------------------
insert into auth.users (id, instance_id, email, raw_user_meta_data, aud, role, created_at, updated_at)
values
  ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000',
   'marc.tremblay@trucktrack.local',
   '{"role":"operator","display_name":"Marc Tremblay","language":"fr"}'::jsonb,
   'authenticated', 'authenticated', now(), now()),

  ('a0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000',
   'carlos.mendez@trucktrack.local',
   '{"role":"operator","display_name":"Carlos Mendez","language":"en"}'::jsonb,
   'authenticated', 'authenticated', now(), now()),

  ('a0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000',
   'sarah.chen@trucktrack.local',
   '{"role":"operator","display_name":"Sarah Chen","language":"en"}'::jsonb,
   'authenticated', 'authenticated', now(), now()),

  ('a0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000',
   'linh.nguyen@trucktrack.local',
   '{"role":"operator","display_name":"Linh Nguyen","language":"en"}'::jsonb,
   'authenticated', 'authenticated', now(), now()),

  ('a0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000',
   'ahmed.khalil@trucktrack.local',
   '{"role":"operator","display_name":"Ahmed Khalil","language":"en"}'::jsonb,
   'authenticated', 'authenticated', now(), now()),

  ('a0000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000000',
   'julie.dubois@trucktrack.local',
   '{"role":"operator","display_name":"Julie Dubois","language":"fr"}'::jsonb,
   'authenticated', 'authenticated', now(), now()),

  ('a0000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000000',
   'emma.wilson@trucktrack.local',
   '{"role":"operator","display_name":"Emma Wilson","language":"en"}'::jsonb,
   'authenticated', 'authenticated', now(), now()),

  ('a0000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000000',
   'alex.park@trucktrack.local',
   '{"role":"operator","display_name":"Alex Park","language":"en"}'::jsonb,
   'authenticated', 'authenticated', now(), now())
on conflict (id) do nothing;

-- Avatar URLs — separate UPDATE since the TT-13 trigger doesn't carry
-- avatar_url through raw_user_meta_data. Single VALUES-driven UPDATE
-- with `is distinct from` so re-running the seed is a true no-op (no
-- updated_at trigger fire when nothing's changed).
-- Unsplash portrait photos. All URLs verified 200 OK at commit time.
update public.profiles p
set avatar_url = v.avatar_url
from (
  values
    ('a0000000-0000-0000-0000-000000000001'::uuid,
     'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80'),
    ('a0000000-0000-0000-0000-000000000002'::uuid,
     'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80'),
    ('a0000000-0000-0000-0000-000000000003'::uuid,
     'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80'),
    ('a0000000-0000-0000-0000-000000000004'::uuid,
     'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80'),
    ('a0000000-0000-0000-0000-000000000005'::uuid,
     'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&q=80'),
    ('a0000000-0000-0000-0000-000000000006'::uuid,
     'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80'),
    ('a0000000-0000-0000-0000-000000000007'::uuid,
     'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80'),
    ('a0000000-0000-0000-0000-000000000008'::uuid,
     'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80')
) as v(id, avatar_url)
where p.id = v.id
  and p.avatar_url is distinct from v.avatar_url;

-- ---------------------------------------------------------------------
-- 2. Trucks — 8 rows covering every plan tier + paused state.
--    Order matches operators above.
-- ---------------------------------------------------------------------
insert into public.trucks (
  id, operator_id, name, cuisine_tags, description, cover_url, plan,
  is_active, catering_enabled
)
values
  ('b0000000-0000-0000-0000-000000000001',
   'a0000000-0000-0000-0000-000000000001',
   'Smoke''s Poutinerie',
   array['poutine', 'canadian'],
   'Hand-cut Yukon Gold fries, squeaky cheese curds, and gravy from scratch since 2019. Twenty-plus toppings on rotation.',
   'https://images.unsplash.com/photo-1639024471283-03518883512d?w=800&q=80',
   'starter', true, false),

  ('b0000000-0000-0000-0000-000000000002',
   'a0000000-0000-0000-0000-000000000002',
   'Tacos El Gordo',
   array['mexican', 'tacos', 'street-food'],
   'Authentic Tijuana-style tacos. Hand-pressed corn tortillas, slow-braised carnitas, and salsas made fresh every morning.',
   'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
   'pro', true, true),

  ('b0000000-0000-0000-0000-000000000003',
   'a0000000-0000-0000-0000-000000000003',
   'Beavertails',
   array['dessert', 'canadian', 'pastry'],
   'Hot, hand-stretched whole-wheat pastries dusted with cinnamon sugar. A Sparks Street fixture for thirty years.',
   'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80',
   'free', true, false),

  ('b0000000-0000-0000-0000-000000000004',
   'a0000000-0000-0000-0000-000000000004',
   'Pho King',
   array['vietnamese', 'noodles', 'soup'],
   'Twelve-hour bone broth pho, banh mi, and bubble tea. Family recipe brought from Hanoi to Preston Street.',
   'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&q=80',
   'starter', true, false),

  ('b0000000-0000-0000-0000-000000000005',
   'a0000000-0000-0000-0000-000000000005',
   'Shawarma Palace',
   array['middle-eastern', 'shawarma', 'wraps'],
   'Slow-roasted chicken and beef shawarma stacks, fresh-baked pita, and house-made garlic sauce. Catering for 10–500 guests.',
   'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800&q=80',
   'pro', true, true),

  ('b0000000-0000-0000-0000-000000000006',
   'a0000000-0000-0000-0000-000000000006',
   'Frostbite Ice Cream',
   array['dessert', 'ice-cream'],
   'Liquid-nitrogen ice cream made to order in 60 seconds. Twenty rotating flavours, plus dairy-free options. Closed for winter.',
   'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800&q=80',
   'free', false, false),

  ('b0000000-0000-0000-0000-000000000007',
   'a0000000-0000-0000-0000-000000000007',
   'Maple Cup Coffee',
   array['coffee', 'pastries', 'breakfast'],
   'Single-origin pour-overs, maple lattes, and morning pastries from a converted Airstream. On winter break — back in spring.',
   'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
   'pro', false, false),

  ('b0000000-0000-0000-0000-000000000008',
   'a0000000-0000-0000-0000-000000000008',
   'Mystery Truck',
   array['fusion', 'street-food'],
   'A roving pop-up serving a different cuisine every week. Follow for location drops — no fixed schedule.',
   'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&q=80',
   'starter', true, false)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- 3. Today's truck_schedules — up to 5 rows.
--    - Smoke's + Tacos: live-now, always seeded for today
--    - Beavertails: closed-today, seeded only when full window fits today
--    - Pho King: scheduled-later, seeded only when full window fits today
--    - Shawarma: cancelled, always seeded for today (status filter hides)
--    - Frostbite + Maple Cup: is_active=false, no schedule needed
--    - Mystery Truck: intentionally no schedule row at all
--
-- Time-of-reset invariance: open/close are computed RELATIVE TO NOW
-- so the documented matrix holds regardless of the local clock.
--
-- Date integrity invariant: every seeded row satisfies
-- `open_time < close_time` on its `date` column. Live-now uses a
-- full-day window today; cancelled uses arbitrary same-day times;
-- closed-today and scheduled-later are CONDITIONALLY inserted via
-- INSERT…SELECT…WHERE so a row only lands when both its open AND
-- close offsets fall within current_date. Anchoring just `date`
-- (with the times still derived from now()±offset) doesn't satisfy
-- the invariant — at e.g. 06:00 reset, closed-today's open offset
-- wraps to yesterday's clock (23:30) while close stays today's
-- clock (05:30), producing open>close on whichever date we anchor.
--
-- Net visibility under this rule:
--   - closed-today seeded between ~06:30 and ~23:59:30 reset (≈17.5h)
--   - scheduled-later seeded between 00:00 and ~17:29:30 reset (≈17.5h)
-- The remaining ~6.5h/day each row is absent from the seed entirely,
-- which is preferable to surfacing internally inconsistent data.
-- ---------------------------------------------------------------------

-- Always-seeded rows: live-now (×2) + cancelled.
insert into public.truck_schedules (
  id, truck_id, date, location_lat, location_lng, location_label,
  open_time, close_time, status
)
values
  -- LIVE NOW — full-day window always brackets now(). isOpen=true at
  -- any reset clock time.
  ('c0000000-0000-0000-0000-000000000001',
   'b0000000-0000-0000-0000-000000000001', current_date,
   45.4283, -75.6919, 'ByWard Market',
   time '00:00:00', time '23:59:59', 'live'),

  -- LIVE NOW + catering operator at Lansdowne.
  ('c0000000-0000-0000-0000-000000000002',
   'b0000000-0000-0000-0000-000000000002', current_date,
   45.4001, -75.6831, 'Lansdowne Park',
   time '00:00:00', time '23:59:59', 'live'),

  -- CANCELLED TODAY — useTrucks filter excludes cancelled, so no pin
  -- renders. Times + date are arbitrary; the cancelled status is what
  -- matters.
  ('c0000000-0000-0000-0000-000000000005',
   'b0000000-0000-0000-0000-000000000005', current_date,
   45.3956, -75.7559, 'Westboro',
   time '11:00', time '20:00', 'cancelled')
on conflict (id) do nothing;

-- CLOSED TODAY — window ENDED 30min before now() and lasted 6h.
-- Status='live' so the useTrucks query still returns it; isOpen
-- derives false because now > close_time. The WHERE clause guarantees
-- both offsets land on current_date so open_time < close_time always
-- holds on the seeded date.
insert into public.truck_schedules (
  id, truck_id, date, location_lat, location_lng, location_label,
  open_time, close_time, status
)
select
  'c0000000-0000-0000-0000-000000000003'::uuid,
  'b0000000-0000-0000-0000-000000000003'::uuid,
  current_date,
  45.4218, -75.6995, 'Sparks Street',
  (date_trunc('second', now() - interval '6 hours 30 minutes'))::time,
  (date_trunc('second', now() - interval '30 minutes'))::time,
  'live'
where (now() - interval '6 hours 30 minutes')::date = current_date
  and (now() - interval '30 minutes')::date = current_date
on conflict (id) do nothing;

-- SCHEDULED LATER TODAY — window OPENS 30min from now() and lasts 6h.
-- Renders as a grey pin with "Opens at HH:MM" in the sheet (TT-39).
-- The WHERE clause guarantees both offsets land on current_date so
-- open_time < close_time always holds on the seeded date.
insert into public.truck_schedules (
  id, truck_id, date, location_lat, location_lng, location_label,
  open_time, close_time, status
)
select
  'c0000000-0000-0000-0000-000000000004'::uuid,
  'b0000000-0000-0000-0000-000000000004'::uuid,
  current_date,
  45.4099, -75.7101, 'Preston Street',
  (date_trunc('second', now() + interval '30 minutes'))::time,
  (date_trunc('second', now() + interval '6 hours 30 minutes'))::time,
  'scheduled'
where (now() + interval '30 minutes')::date = current_date
  and (now() + interval '6 hours 30 minutes')::date = current_date
on conflict (id) do nothing;
