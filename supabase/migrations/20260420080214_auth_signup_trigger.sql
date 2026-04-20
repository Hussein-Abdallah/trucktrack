-- TT-13 — auto-create public.profiles row on auth.users insert.
--
-- Runs as SECURITY DEFINER so the insert bypasses RLS (profiles has an
-- owner-only SELECT policy; at trigger time there's no auth.uid() anyway).
-- search_path is pinned to '' + all table refs fully qualified, matching
-- the hardening pattern TT-12 applied to public.set_updated_at.
--
-- Client metadata contract (supabase.auth.signUp options.data):
--   role          text, required for email signup; one of 'consumer' | 'operator'.
--                 Absent for OAuth / magic-link — see guard below.
--   language      text, optional; one of 'en' | 'fr'. Defaults to 'en' via
--                 the profiles.language column default when omitted.
--   display_name  text, optional; null when absent.
--
-- Guard: the trigger ONLY inserts when raw_user_meta_data carries a 'role'
-- key. Email signup (TT-32) lands the key → profile row created atomically
-- with auth.users. OAuth signup (TT-33) lands without it → trigger no-ops
-- and the client creates the profile row post-auth via the owner-scoped
-- INSERT policy that ships with TT-33.
--
-- Invalid role (e.g. 'admin') trips the profiles_roles_valid CHECK and
-- propagates back to the signUp caller as a typed error — fail-loud by
-- design. Supabase dashboard admins creating users manually without
-- metadata: trigger no-ops, and the admin must populate profiles.roles
-- through a separate step.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.raw_user_meta_data ? 'role' then
    insert into public.profiles (id, roles, display_name, language)
    values (
      new.id,
      array[new.raw_user_meta_data ->> 'role']::text[],
      new.raw_user_meta_data ->> 'display_name',
      coalesce(new.raw_user_meta_data ->> 'language', 'en')
    );
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
