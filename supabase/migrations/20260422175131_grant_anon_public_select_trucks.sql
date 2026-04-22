-- The TT-12 RLS migration named the discovery-surface policies
-- `*_public_select` but scoped them only to the `authenticated` role.
-- That breaks the consumer map for unauthenticated visitors — the whole
-- point of the public_select policies. TT-35's useTrucks hook needs to
-- run anonymously (no sign-in required to browse the map), so we
-- broaden the policies' role grants to include `anon`.
--
-- Drop + re-create rather than alter, since postgres has no
-- `alter policy ... to ...` syntax for changing the role list. The
-- using clauses stay identical to the originals in
-- 20260419200233_rls_core_tables.sql.

drop policy if exists trucks_public_select on public.trucks;

create policy trucks_public_select on public.trucks
  for select to anon, authenticated
  using (is_active = true);

drop policy if exists truck_schedules_public_select on public.truck_schedules;

create policy truck_schedules_public_select on public.truck_schedules
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.trucks
      where public.trucks.id = truck_schedules.truck_id
        and public.trucks.is_active = true
    )
  );
