-- Settings: theme sync, editable name, self-service account deletion.
-- Run once in Supabase Dashboard -> SQL Editor, BEFORE deploying the Settings page.

-- theme: null = never chosen, so the client keeps the device/OS preference.
-- (The old 'light' default would flip dark-OS users to light on first sign-in.)
-- Nothing wrote theme before this migration, so resetting it loses no choice.
alter table public.profiles
  alter column theme drop not null,
  alter column theme drop default;
update public.profiles set theme = null;

-- Abuse guard only (the UI caps at 80). Loose so the sign-up trigger never
-- fails on a long Google name.
alter table public.profiles
  add constraint profiles_full_name_length check (length(full_name) <= 200);

-- Deletes the caller's auth user; FKs cascade to profiles -> categories/movements.
create function public.delete_account()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.users where id = auth.uid();
$$;

revoke execute on function public.delete_account() from public, anon;
grant execute on function public.delete_account() to authenticated;
