-- Harden public.set_updated_at against search_path hijacking.
-- Supabase's security advisor flags functions without a pinned
-- search_path (CVE-class risk: a user-created object in a higher-
-- priority schema could be resolved during function execution).
--
-- The function does not reference any table by name, so the empty
-- search_path is safe and strictest.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
