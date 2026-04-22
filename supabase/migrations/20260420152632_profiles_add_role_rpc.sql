-- TT-32 follow-up — atomic role-append RPC.
--
-- The client-side read-then-write in services/auth.ts
-- ensureRoleForVariant is susceptible to lost updates under
-- concurrency (two callers read the same roles[] and the later
-- UPDATE clobbers the earlier one). A single UPDATE with
-- array_append + a conditional WHERE runs under a row lock, so
-- concurrent callers serialise correctly and each append survives.
--
-- SECURITY DEFINER + explicit auth.uid() check rather than relying
-- on RLS alone so anon callers fail loudly with a clear exception
-- instead of a silent 0-row update. Matches the hardening pattern
-- TT-13's handle_new_user() established (security definer +
-- search_path = '' + fully-qualified refs).
--
-- Invalid role values still trip the profiles_roles_valid CHECK
-- constraint (TT-13) — the array_append produces an array that
-- violates the CHECK, the UPDATE fails, the exception propagates
-- to the client as a typed InvalidRoleError in services/auth.ts.

create or replace function public.profiles_add_role(
  p_user_id uuid,
  p_role text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rows_updated integer;
begin
  -- Reject NULL / empty roles up-front. Without this, NULL p_role makes
  -- the WHERE clause below evaluate to NULL (three-valued logic), the
  -- UPDATE no-ops, the existence probe finds the row, and the function
  -- silently returns success without appending anything. The
  -- profiles_roles_valid CHECK doesn't catch it either — `<@` against
  -- a NULL element evaluates to NULL, which CHECK treats as passing.
  if p_role is null or btrim(p_role) = '' then
    raise exception 'role must be a non-empty string' using errcode = '22004';
  end if;

  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if auth.uid() <> p_user_id then
    raise exception 'forbidden: caller must be the profile owner' using errcode = '42501';
  end if;

  update public.profiles
  set roles = array_append(roles, p_role)
  where id = p_user_id
    and not (p_role = any(roles));

  -- Zero rows updated has two meanings: the role was already present
  -- (idempotent success) or the profile row doesn't exist (must raise,
  -- otherwise the RPC reports success while the role was never
  -- assigned). Disambiguate with a follow-up existence probe.
  get diagnostics v_rows_updated = row_count;
  if v_rows_updated = 0 then
    if not exists (select 1 from public.profiles where id = p_user_id) then
      raise exception 'profile row missing for authenticated user'
        using errcode = 'P0002';
    end if;
  end if;
end;
$$;

-- Restrict callability. The explicit auth.uid() check inside the
-- body would catch anon callers anyway, but defence-in-depth: don't
-- let the function be invoked at all without an authenticated JWT.
revoke execute on function public.profiles_add_role(uuid, text) from public;
grant execute on function public.profiles_add_role(uuid, text) to authenticated;
