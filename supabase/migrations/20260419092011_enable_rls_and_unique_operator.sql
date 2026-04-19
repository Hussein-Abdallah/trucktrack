-- Harden core tables after initial creation.
--
-- Addresses CodeRabbit review on PR #10:
-- 1. Enable RLS on every core table so deny-by-default is enforced
--    at the schema level regardless of project-level settings.
--    Policies themselves land in TT-12 — until then any authenticated
--    query against these tables returns zero rows (service_role and
--    Edge Functions bypass RLS as designed).
-- 2. Enforce the "one truck per operator (MVP)" invariant at the DB
--    level. The comment in the create-table migration promised it;
--    now the schema does too.

alter table public.profiles         enable row level security;
alter table public.trucks           enable row level security;
alter table public.truck_schedules  enable row level security;
alter table public.follows          enable row level security;

-- Single truck per operator. When multi-truck operators become a
-- feature, drop this constraint in its own migration — do not edit
-- this file.
alter table public.trucks
  add constraint trucks_operator_id_unique unique (operator_id);

-- The UNIQUE constraint creates its own index on operator_id, so the
-- earlier explicit index is redundant.
drop index if exists public.trucks_operator_id_idx;
