-- TT-12 — RLS policies for the four core tables.
--
-- TT-11 enabled RLS on profiles, trucks, truck_schedules, follows but
-- shipped no policies — so any authenticated query currently returns
-- zero rows. This migration lands the read/write policies that unblock
-- every data-backed feature ticket downstream.
--
-- Naming convention: <table>_<role>_<action>
--   <role>   = public (any authenticated user) | owner (row's owning user)
--   <action> = select | insert | update | delete | all
--
-- Conventions (hold for all future policy migrations):
-- * Every policy is scoped TO authenticated. The anon role receives no
--   policies, so deny-by-default keeps anonymous requests at zero rows
--   without a separate policy per table.
-- * Table references inside predicates are fully qualified (public.xyz)
--   to match the search_path discipline used in set_updated_at().
-- * No USING (true) — deny by default, widen explicitly.
-- * Service role bypasses RLS by design. Edge Functions therefore need
--   no policies; they read and write freely using the secret key.

-- profiles ---------------------------------------------------------------
-- SELECT only. INSERT is owned by the TT-13 signup trigger (security
-- definer, bypasses RLS). UPDATE lands with the first profile-edit
-- screen. DELETE happens via ON DELETE CASCADE from auth.users.
create policy profiles_owner_select on public.profiles
  for select to authenticated
  using (auth.uid() = id);

-- trucks -----------------------------------------------------------------
-- Two SELECT policies are OR'd by Postgres: the public sees active
-- trucks, and the owner additionally sees their own paused truck
-- (winter pause edge case — is_active = false).
create policy trucks_public_select on public.trucks
  for select to authenticated
  using (is_active = true);

create policy trucks_owner_select on public.trucks
  for select to authenticated
  using (operator_id = auth.uid());

create policy trucks_owner_insert on public.trucks
  for insert to authenticated
  with check (operator_id = auth.uid());

create policy trucks_owner_update on public.trucks
  for update to authenticated
  using (operator_id = auth.uid())
  with check (operator_id = auth.uid());

create policy trucks_owner_delete on public.trucks
  for delete to authenticated
  using (operator_id = auth.uid());

-- truck_schedules --------------------------------------------------------
-- Predicates join to public.trucks via the already-indexed primary key.
-- Same "public sees active, owner sees own" shape as trucks.
create policy truck_schedules_public_select on public.truck_schedules
  for select to authenticated
  using (
    exists (
      select 1 from public.trucks
      where public.trucks.id = truck_schedules.truck_id
        and public.trucks.is_active = true
    )
  );

create policy truck_schedules_owner_select on public.truck_schedules
  for select to authenticated
  using (
    exists (
      select 1 from public.trucks
      where public.trucks.id = truck_schedules.truck_id
        and public.trucks.operator_id = auth.uid()
    )
  );

create policy truck_schedules_owner_insert on public.truck_schedules
  for insert to authenticated
  with check (
    exists (
      select 1 from public.trucks
      where public.trucks.id = truck_schedules.truck_id
        and public.trucks.operator_id = auth.uid()
    )
  );

create policy truck_schedules_owner_update on public.truck_schedules
  for update to authenticated
  using (
    exists (
      select 1 from public.trucks
      where public.trucks.id = truck_schedules.truck_id
        and public.trucks.operator_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.trucks
      where public.trucks.id = truck_schedules.truck_id
        and public.trucks.operator_id = auth.uid()
    )
  );

create policy truck_schedules_owner_delete on public.truck_schedules
  for delete to authenticated
  using (
    exists (
      select 1 from public.trucks
      where public.trucks.id = truck_schedules.truck_id
        and public.trucks.operator_id = auth.uid()
    )
  );

-- follows ----------------------------------------------------------------
-- Uniform predicate across every action — consolidate into FOR ALL.
create policy follows_owner_all on public.follows
  for all to authenticated
  using (consumer_id = auth.uid())
  with check (consumer_id = auth.uid());
