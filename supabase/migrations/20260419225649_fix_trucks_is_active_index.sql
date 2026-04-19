-- Fix the column choice for trucks_is_active_true_idx.
--
-- The previous migration created this partial index over the is_active
-- column — but since the WHERE predicate already restricts every row to
-- is_active = true, every index entry had an identical key. The column
-- added zero selectivity and the index was useful only as a bitmap of
-- TIDs to active trucks.
--
-- Indexing (id) with the same partial predicate is the correct shape for
-- this workload: the trucks_public_select policy and every
-- truck_schedules_*_select policy all join trucks on id with the
-- is_active = true filter. An index-only scan over (id) WHERE is_active
-- = true satisfies both predicates without a heap fetch, and the index
-- skips paused trucks entirely (smaller than trucks_pkey).

drop index if exists public.trucks_is_active_true_idx;

create index trucks_is_active_true_idx
  on public.trucks (id)
  where is_active = true;
