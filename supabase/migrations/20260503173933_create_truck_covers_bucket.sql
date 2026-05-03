-- TT-9 — operator onboarding cover-photo Storage bucket
-- ====================================================================
-- First Storage bucket in the project. Operators upload a cover photo
-- during onboarding (step 4 of the wizard) which renders on the
-- consumer-side truck profile.
--
-- Bucket layout: <operator_id>/cover-<timestamp>.<ext>
-- The path-prefix-as-userId scheme is the canonical Supabase Storage
-- pattern — RLS uses storage.foldername(name)[1] to scope writes to
-- the calling operator's directory only.
--
-- Visibility: public read. Cover photos render on consumer-facing
-- truck profiles, which include unauthenticated map detail views.
-- The trade-off is that anyone with the storage URL can fetch the
-- image — same trade-off as Unsplash hot-linking already in seed.sql.
-- ====================================================================

-- 1. Create the bucket -------------------------------------------------
-- ON CONFLICT DO NOTHING so re-running this migration via `npx supabase
-- db reset` is a no-op rather than a hard error.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'truck-covers',
  'truck-covers',
  true,            -- public read; covers render on the consumer map
  10485760,        -- 10 MiB max per cover (10 * 1024 * 1024)
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do nothing;

-- 2. RLS policies on storage.objects ----------------------------------
-- storage.objects already has RLS enabled by Supabase — we just add
-- bucket-scoped policies.
--
-- Public select (anyone can fetch a cover): the bucket-level
-- public=true above already covers anonymous reads via the public CDN
-- URL, but a permissive SELECT policy here keeps signed-URL reads from
-- service-role-less clients working too.

create policy "truck_covers_public_select"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'truck-covers');

-- Authenticated insert into your own folder only.
-- storage.foldername(name) returns the path components as a text[];
-- [1] is the first folder. Comparing it against auth.uid()::text
-- enforces that an operator can only write to their own UUID prefix.
create policy "truck_covers_owner_insert"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'truck-covers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated update of your own files only — same scope.
-- Needed when the operator replaces their cover (re-uploads with the
-- same path or overwrites).
create policy "truck_covers_owner_update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'truck-covers'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'truck-covers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated delete of your own files only.
-- Cover deletion is not exercised by TT-9, but the policy lands now so
-- a future "remove cover photo" feature doesn't need a follow-up
-- migration.
create policy "truck_covers_owner_delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'truck-covers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
