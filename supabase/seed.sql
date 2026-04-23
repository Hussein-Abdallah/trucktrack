-- TT-41 — dev seed data (expanded for richer UI testing)
-- ====================================================================
-- Purpose: populate a fresh local DB (`npm run db:reset`) with 20
-- trucks total (10 visible on the consumer map, 10 hidden) so every UI
-- surface — open / closed / scheduled / cancelled / paused / no-schedule
-- — renders meaningfully out of the box, AND the bottom-sheet card list
-- has enough rows to feel real instead of feeling like a stub.
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
-- and may be hot-linked.
--
-- Visibility breakdown (against TT-35 useTrucks filter:
--   is_active = true AND truck_schedules.date = current_date
--   AND status IN ('live','scheduled')):
--
--   10 VISIBLE (always — no conditional inserts):
--     6 live, full-day window  → always "OPEN NOW" visually
--     3 live, restricted hours → open or closed depending on clock
--     1 scheduled (status='scheduled') → exercises the second branch
--                                        of the useTrucks status filter
--
--   10 HIDDEN:
--     3 cancelled today (status filter excludes)
--     4 is_active = false (winter pause / frozen plan)
--     3 active but no schedule today (inner-join excludes)
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
   'authenticated', 'authenticated', now(), now()),

  ('a0000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000000',
   'diego.alvarez@trucktrack.local',
   '{"role":"operator","display_name":"Diego Alvarez","language":"en"}'::jsonb,
   'authenticated', 'authenticated', now(), now()),

  ('a0000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000000',
   'haruto.tanaka@trucktrack.local',
   '{"role":"operator","display_name":"Haruto Tanaka","language":"en"}'::jsonb,
   'authenticated', 'authenticated', now(), now()),

  ('a0000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000000',
   'youssef.hassan@trucktrack.local',
   '{"role":"operator","display_name":"Youssef Hassan","language":"en"}'::jsonb,
   'authenticated', 'authenticated', now(), now()),

  ('a0000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000000',
   'sophie.lavoie@trucktrack.local',
   '{"role":"operator","display_name":"Sophie Lavoie","language":"fr"}'::jsonb,
   'authenticated', 'authenticated', now(), now()),

  ('a0000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000000',
   'nikos.papadopoulos@trucktrack.local',
   '{"role":"operator","display_name":"Nikos Papadopoulos","language":"en"}'::jsonb,
   'authenticated', 'authenticated', now(), now()),

  ('a0000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000000',
   'martina.rossi@trucktrack.local',
   '{"role":"operator","display_name":"Martina Rossi","language":"en"}'::jsonb,
   'authenticated', 'authenticated', now(), now()),

  ('a0000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000000',
   'jin.kim@trucktrack.local',
   '{"role":"operator","display_name":"Jin Kim","language":"en"}'::jsonb,
   'authenticated', 'authenticated', now(), now()),

  ('a0000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000000',
   'priya.singh@trucktrack.local',
   '{"role":"operator","display_name":"Priya Singh","language":"en"}'::jsonb,
   'authenticated', 'authenticated', now(), now()),

  ('a0000000-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000000',
   'felipe.santos@trucktrack.local',
   '{"role":"operator","display_name":"Felipe Santos","language":"en"}'::jsonb,
   'authenticated', 'authenticated', now(), now()),

  ('a0000000-0000-0000-0000-000000000018', '00000000-0000-0000-0000-000000000000',
   'amelie.bouchard@trucktrack.local',
   '{"role":"operator","display_name":"Amélie Bouchard","language":"fr"}'::jsonb,
   'authenticated', 'authenticated', now(), now()),

  ('a0000000-0000-0000-0000-000000000019', '00000000-0000-0000-0000-000000000000',
   'omar.farah@trucktrack.local',
   '{"role":"operator","display_name":"Omar Farah","language":"en"}'::jsonb,
   'authenticated', 'authenticated', now(), now()),

  ('a0000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000000',
   'lucas.brown@trucktrack.local',
   '{"role":"operator","display_name":"Lucas Brown","language":"en"}'::jsonb,
   'authenticated', 'authenticated', now(), now())
on conflict (id) do nothing;

-- Avatar URLs — separate UPDATE since the TT-13 trigger doesn't carry
-- avatar_url through raw_user_meta_data. Single VALUES-driven UPDATE
-- with `is distinct from` so re-running the seed is a true no-op (no
-- updated_at trigger fire when nothing's changed).
update public.profiles p
set avatar_url = v.avatar_url
from (
  values
    ('a0000000-0000-0000-0000-000000000001'::uuid, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80'),
    ('a0000000-0000-0000-0000-000000000002'::uuid, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80'),
    ('a0000000-0000-0000-0000-000000000003'::uuid, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80'),
    ('a0000000-0000-0000-0000-000000000004'::uuid, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80'),
    ('a0000000-0000-0000-0000-000000000005'::uuid, 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&q=80'),
    ('a0000000-0000-0000-0000-000000000006'::uuid, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80'),
    ('a0000000-0000-0000-0000-000000000007'::uuid, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80'),
    ('a0000000-0000-0000-0000-000000000008'::uuid, 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80'),
    ('a0000000-0000-0000-0000-000000000009'::uuid, 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400&q=80'),
    ('a0000000-0000-0000-0000-000000000010'::uuid, 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&q=80'),
    ('a0000000-0000-0000-0000-000000000011'::uuid, 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80'),
    ('a0000000-0000-0000-0000-000000000012'::uuid, 'https://images.unsplash.com/photo-1485893086445-ed75865251e0?w=400&q=80'),
    ('a0000000-0000-0000-0000-000000000013'::uuid, 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&q=80'),
    ('a0000000-0000-0000-0000-000000000014'::uuid, 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80'),
    ('a0000000-0000-0000-0000-000000000015'::uuid, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80'),
    ('a0000000-0000-0000-0000-000000000016'::uuid, 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&q=80'),
    ('a0000000-0000-0000-0000-000000000017'::uuid, 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80'),
    ('a0000000-0000-0000-0000-000000000018'::uuid, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80'),
    ('a0000000-0000-0000-0000-000000000019'::uuid, 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80'),
    ('a0000000-0000-0000-0000-000000000020'::uuid, 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&q=80')
) as v(id, avatar_url)
where p.id = v.id
  and p.avatar_url is distinct from v.avatar_url;

-- ---------------------------------------------------------------------
-- 2. Trucks — 20 rows total.
--    01–10: VISIBLE (active, schedule below)
--    11–13: cancelled today (active but cancelled status hides them)
--    14–17: inactive (winter pause / frozen plan)
--    18–20: active but NO schedule today (inner-join hides)
-- ---------------------------------------------------------------------
insert into public.trucks (
  id, operator_id, name, cuisine_tags, description, cover_url, plan,
  is_active, catering_enabled
)
values
  -- VISIBLE 01–10 ------------------------------------------------------
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
   'Mystery Truck',
   array['fusion', 'street-food'],
   'A roving pop-up serving a different cuisine every week. Follow for location drops — surprise menu, locked-in mystery.',
   'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&q=80',
   'starter', true, false),

  ('b0000000-0000-0000-0000-000000000006',
   'a0000000-0000-0000-0000-000000000009',
   'Burger Bunker',
   array['burgers', 'american', 'comfort'],
   'Smash burgers on house-baked brioche, hand-cut fries, and milkshakes blended with local Bridgehead beans.',
   'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
   'pro', true, false),

  ('b0000000-0000-0000-0000-000000000007',
   'a0000000-0000-0000-0000-000000000010',
   'Sushi Wagon',
   array['japanese', 'sushi', 'rice-bowls'],
   'Edomae-style sushi rolls, chirashi bowls, and miso soup from a third-generation Tokyo-trained itamae.',
   'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80',
   'pro', true, true),

  ('b0000000-0000-0000-0000-000000000008',
   'a0000000-0000-0000-0000-000000000011',
   'The Falafel Bus',
   array['middle-eastern', 'falafel', 'vegetarian'],
   'Crispy chickpea falafel, hand-rolled and fried to order, in pita with house-pickled vegetables and tahini.',
   'https://images.unsplash.com/photo-1593504049359-74330189a345?w=800&q=80',
   'starter', true, false),

  ('b0000000-0000-0000-0000-000000000009',
   'a0000000-0000-0000-0000-000000000012',
   'La Crêperie',
   array['french', 'crepes', 'breakfast'],
   'Buchwheat galettes and sweet crêpes from a Bretagne-trained crêpière. Maple-syrup specials all winter.',
   'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80',
   'free', true, false),

  ('b0000000-0000-0000-0000-000000000010',
   'a0000000-0000-0000-0000-000000000013',
   'Greek Fire',
   array['greek', 'gyros', 'mediterranean'],
   'Spit-roasted lamb and chicken gyros, hand-cut tzatziki, and lemon potatoes. Built on a converted 1970s school bus.',
   'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&q=80',
   'starter', true, true),

  -- CANCELLED TODAY 11–13 (active but schedule.status='cancelled') ----
  ('b0000000-0000-0000-0000-000000000011',
   'a0000000-0000-0000-0000-000000000006',
   'Shawarma Palace',
   array['middle-eastern', 'shawarma', 'wraps'],
   'Slow-roasted chicken and beef shawarma stacks, fresh-baked pita, and house-made garlic sauce. Catering for 10–500 guests.',
   'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800&q=80',
   'pro', true, true),

  ('b0000000-0000-0000-0000-000000000012',
   'a0000000-0000-0000-0000-000000000014',
   'Bao Down',
   array['chinese', 'bao', 'dumplings'],
   'Steamed pork belly bao, scallion pancakes, and pan-fried gyoza. Cancelled today — equipment maintenance.',
   'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=80',
   'pro', true, false),

  ('b0000000-0000-0000-0000-000000000013',
   'a0000000-0000-0000-0000-000000000017',
   'Sundae Best',
   array['dessert', 'ice-cream', 'sweets'],
   'Soft-serve sundaes with house-made caramel + chocolate ganache. Cancelled today for staff training.',
   'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80',
   'starter', true, false),

  -- INACTIVE 14–17 (is_active=false; winter pause / frozen plan) ------
  ('b0000000-0000-0000-0000-000000000014',
   'a0000000-0000-0000-0000-000000000007',
   'Frostbite Ice Cream',
   array['dessert', 'ice-cream'],
   'Liquid-nitrogen ice cream made to order in 60 seconds. Closed for winter — back in May.',
   'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800&q=80',
   'free', false, false),

  ('b0000000-0000-0000-0000-000000000015',
   'a0000000-0000-0000-0000-000000000008',
   'Maple Cup Coffee',
   array['coffee', 'pastries', 'breakfast'],
   'Single-origin pour-overs, maple lattes, and morning pastries from a converted Airstream. On winter break.',
   'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
   'pro', false, false),

  ('b0000000-0000-0000-0000-000000000016',
   'a0000000-0000-0000-0000-000000000015',
   'Korean Fried',
   array['korean', 'fried-chicken'],
   'Double-fried Korean wings in gochujang glaze. Subscription paused — back when the festival circuit reopens.',
   'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&q=80',
   'starter', false, false),

  ('b0000000-0000-0000-0000-000000000017',
   'a0000000-0000-0000-0000-000000000018',
   'Café Sucré',
   array['french', 'pastry', 'coffee'],
   'Buttery croissants, pain au chocolat, and espresso from a Parisian-trained baker. Currently inactive.',
   'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80',
   'free', false, false),

  -- ACTIVE BUT NO SCHEDULE TODAY 18–20 (inner-join hides) -------------
  ('b0000000-0000-0000-0000-000000000018',
   'a0000000-0000-0000-0000-000000000016',
   'Empanadas Argentinas',
   array['latin', 'empanadas', 'pastry'],
   'Hand-folded empanadas — beef, chicken, spinach-and-cheese — baked to order. Tomorrow''s schedule lands tonight.',
   'https://images.unsplash.com/photo-1601314002957-8d6d1c5a1d05?w=800&q=80',
   'starter', true, false),

  ('b0000000-0000-0000-0000-000000000019',
   'a0000000-0000-0000-0000-000000000019',
   'Wood-fire Pizza',
   array['italian', 'pizza'],
   'Neapolitan-style pizza fired in 90 seconds at 900°F. Schedule paused this week for kitchen retrofit.',
   'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&q=80',
   'pro', true, true),

  ('b0000000-0000-0000-0000-000000000020',
   'a0000000-0000-0000-0000-000000000020',
   'The Donut Stop',
   array['dessert', 'donuts', 'coffee'],
   'Cake donuts glazed in small batches every two hours. Currently between bookings — check back tomorrow.',
   'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80',
   'free', true, false)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- 3. Today's truck_schedules — 13 rows.
--    Visible 10 = 6 live full-day + 3 live restricted hours +
--    1 scheduled (status='scheduled'), plus
--    3 cancelled (status='cancelled', filtered out by useTrucks).
--
-- All schedules anchor on current_date so a fresh `npm run db:reset`
-- always seeds for "today". Restricted-hour rows mix open/closed
-- visually depending on the current clock; full-day rows always read
-- as "OPEN NOW".
-- ---------------------------------------------------------------------
insert into public.truck_schedules (
  id, truck_id, date, location_lat, location_lng, location_label,
  open_time, close_time, status
)
values
  -- VISIBLE: live full-day (always "open" visually) ------------------
  ('c0000000-0000-0000-0000-000000000001',
   'b0000000-0000-0000-0000-000000000001', current_date,
   45.4283, -75.6919, 'ByWard Market',
   time '00:00:00', time '23:59:59', 'live'),

  ('c0000000-0000-0000-0000-000000000002',
   'b0000000-0000-0000-0000-000000000002', current_date,
   45.4001, -75.6831, 'Lansdowne Park',
   time '00:00:00', time '23:59:59', 'live'),

  ('c0000000-0000-0000-0000-000000000004',
   'b0000000-0000-0000-0000-000000000004', current_date,
   45.4099, -75.7101, 'Preston Street',
   time '00:00:00', time '23:59:59', 'live'),

  ('c0000000-0000-0000-0000-000000000005',
   'b0000000-0000-0000-0000-000000000005', current_date,
   45.3956, -75.7559, 'Westboro',
   time '00:00:00', time '23:59:59', 'live'),

  ('c0000000-0000-0000-0000-000000000006',
   'b0000000-0000-0000-0000-000000000006', current_date,
   45.4060, -75.7240, 'Hintonburg',
   time '00:00:00', time '23:59:59', 'live'),

  ('c0000000-0000-0000-0000-000000000007',
   'b0000000-0000-0000-0000-000000000007', current_date,
   45.3990, -75.6920, 'The Glebe',
   time '00:00:00', time '23:59:59', 'live'),

  ('c0000000-0000-0000-0000-000000000008',
   'b0000000-0000-0000-0000-000000000008', current_date,
   45.4180, -75.6970, 'Centretown',
   time '00:00:00', time '23:59:59', 'live'),

  -- VISIBLE: live with restricted hours (open or closed depending on
  -- reset clock — exercises the muted pin/badge color naturally).
  ('c0000000-0000-0000-0000-000000000003',
   'b0000000-0000-0000-0000-000000000003', current_date,
   45.4218, -75.6995, 'Sparks Street',
   time '11:00:00', time '17:00:00', 'live'),

  ('c0000000-0000-0000-0000-000000000009',
   'b0000000-0000-0000-0000-000000000009', current_date,
   45.4380, -75.6680, 'Vanier',
   time '07:00:00', time '14:00:00', 'live'),

  -- VISIBLE: scheduled (status='scheduled', filter passes — exercises
  -- the second branch of the useTrucks status filter).
  ('c0000000-0000-0000-0000-000000000010',
   'b0000000-0000-0000-0000-000000000010', current_date,
   45.3940, -75.6920, 'Old Ottawa South',
   time '17:00:00', time '22:00:00', 'scheduled'),

  -- HIDDEN: cancelled today (status filter excludes from useTrucks) --
  ('c0000000-0000-0000-0000-000000000011',
   'b0000000-0000-0000-0000-000000000011', current_date,
   45.3956, -75.7559, 'Westboro',
   time '11:00:00', time '20:00:00', 'cancelled'),

  ('c0000000-0000-0000-0000-000000000012',
   'b0000000-0000-0000-0000-000000000012', current_date,
   45.4150, -75.6850, 'Sandy Hill',
   time '12:00:00', time '21:00:00', 'cancelled'),

  ('c0000000-0000-0000-0000-000000000013',
   'b0000000-0000-0000-0000-000000000013', current_date,
   45.4290, -75.6810, 'New Edinburgh',
   time '14:00:00', time '20:00:00', 'cancelled')
-- DO UPDATE so reruns without `db:reset` refresh the seeded date to
-- today. Without this, fixed UUIDs + DO NOTHING would freeze the date
-- column on the first run, then useTrucks (which filters on
-- current_date) would stop returning these rows tomorrow. `is distinct
-- from` guard avoids needless trigger fires when nothing's changed.
on conflict (id) do update
set
  date = excluded.date,
  location_lat = excluded.location_lat,
  location_lng = excluded.location_lng,
  location_label = excluded.location_label,
  open_time = excluded.open_time,
  close_time = excluded.close_time,
  status = excluded.status
where
  public.truck_schedules.date is distinct from excluded.date
  or public.truck_schedules.location_lat is distinct from excluded.location_lat
  or public.truck_schedules.location_lng is distinct from excluded.location_lng
  or public.truck_schedules.location_label is distinct from excluded.location_label
  or public.truck_schedules.open_time is distinct from excluded.open_time
  or public.truck_schedules.close_time is distinct from excluded.close_time
  or public.truck_schedules.status is distinct from excluded.status;
