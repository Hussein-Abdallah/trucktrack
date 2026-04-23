-- TT-40 — enable Postgres logical-replication events for truck_schedules
-- so the consumer map can refresh pins live when operators publish or
-- change today's location. The supabase_realtime publication is created
-- automatically by Supabase; tables are opt-in.
--
-- Guarded against re-runs because `alter publication ... add table`
-- raises if the table is already a member, and `db reset` replays every
-- migration from zero on a clean catalog where nothing is registered yet.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'truck_schedules'
  ) then
    alter publication supabase_realtime add table public.truck_schedules;
  end if;
end $$;
