-- TT-13 — pivot profiles.role (text) to profiles.roles (text[]) for dual-role
-- support, and add the owner-scoped UPDATE policy needed by the client-side
-- ensureRoleForVariant helper (lands in TT-32).
--
-- Dual-role rationale: operators and consumers have meaningful overlap — an
-- operator typically eats at competing trucks, follows them for market
-- intel, and collects loyalty stamps alongside regular consumers. Instead
-- of forcing a second email / second account for the overlap, profiles.roles
-- carries every role the user has onboarded to. Each app binary reads the
-- array and enables itself when its role is present.
--
-- Pre-production safety: this DROP / ADD COLUMN pair is destructive on
-- populated data. Confirmed safe here because no rows exist yet (the
-- TT-11 schema was never deployed past local dev). Future role-shape
-- changes MUST use a non-destructive ALTER TABLE migration path.
--
-- RLS: TT-12 policies key off id / operator_id / consumer_id and do NOT
-- reference role / roles, so no policy rewrites are required. Only the
-- NEW policy (profiles_owner_update) lands here.

alter table public.profiles drop column role;

alter table public.profiles
  add column roles text[] not null default array[]::text[];

alter table public.profiles
  add constraint profiles_roles_valid
  check (
    cardinality(roles) > 0
    and roles <@ array['consumer', 'operator']::text[]
  );

-- profiles_owner_update — allows a user to update their own profile row.
-- Required so the TT-32 client helper can append the variant's role to
-- profiles.roles when a user onboards on the second app binary, and so
-- TT-33's OAuth flow can patch display_name / language post-auth.
-- Scoped TO authenticated only; anon has no policies on this table so
-- deny-by-default keeps anonymous requests at zero rows.
create policy profiles_owner_update on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
