-- Partial index supporting the trucks_public_select RLS predicate.
--
-- CodeRabbit flagged that public.trucks.is_active is used in a policy
-- (TT-12 trucks_public_select: using (is_active = true)) without a
-- supporting index. The consumer map query hits this predicate on every
-- authenticated load — the hot path in the app.
--
-- A plain btree on a boolean column is nearly useless (selectivity 50/50),
-- so use a partial index matching the exact predicate shape. It stores
-- only active rows and is tiny; paused trucks (winter) sit outside it.
--
-- No equivalent index needed for follows(consumer_id): the follows table's
-- primary key is (consumer_id, truck_id), and Postgres btree composite
-- indexes support leading-column queries, so follows_owner_all already
-- uses the PK index for its consumer_id = auth.uid() predicate.

create index trucks_is_active_true_idx
  on public.trucks (is_active)
  where is_active = true;
