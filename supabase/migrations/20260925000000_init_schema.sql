-- Initial schema: profiles, categories, movements with RLS.
-- Run once in Supabase Dashboard -> SQL Editor (or `supabase db push`).

-- ---------------------------------------------------------------------------
-- profiles: one row per auth user, created by trigger on sign-up
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  theme text not null default 'light' check (theme in ('light', 'dark')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- categories: user-defined, typed as income or expense
-- ---------------------------------------------------------------------------
create table public.categories (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 50),
  type text not null check (type in ('income', 'expense')),
  icon text not null default '📁',
  color text not null default '#9046FF' check (color ~ '^#[0-9A-Fa-f]{6}$'),
  created_at timestamptz not null default now(),
  unique (user_id, type, name),
  -- Target for the composite FK in movements (same-owner guarantee)
  unique (id, user_id)
);

-- ---------------------------------------------------------------------------
-- movements: income/expense records; type comes from the category
-- ---------------------------------------------------------------------------
create table public.movements (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  category_id bigint not null,
  amount numeric(12, 2) not null check (amount > 0),
  description text check (length(description) <= 200),
  date date not null default current_date,
  paid boolean not null default true,
  created_at timestamptz not null default now(),
  -- A movement can only point to a category owned by the same user.
  -- NO ACTION (not RESTRICT) so a cascading profile delete can remove both.
  foreign key (category_id, user_id) references public.categories (id, user_id)
);

create index movements_user_id_date_idx on public.movements (user_id, date);
create index movements_category_id_idx on public.movements (category_id);

-- ---------------------------------------------------------------------------
-- Row Level Security: each user only sees and edits their own rows
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.movements enable row level security;

create policy "Own profile: select" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "Own profile: update" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "Own categories" on public.categories
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "Own movements" on public.movements
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.categories, public.movements to authenticated;

-- ---------------------------------------------------------------------------
-- On sign-up: create profile + default categories
-- ---------------------------------------------------------------------------
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );

  insert into public.categories (user_id, name, type, icon, color) values
    (new.id, 'Salary',        'income',  '💼', '#53B257'),
    (new.id, 'Other income',  'income',  '💰', '#2E8B57'),
    (new.id, 'Food',          'expense', '🍔', '#FE6156'),
    (new.id, 'Transport',     'expense', '🚌', '#F9743B'),
    (new.id, 'Housing',       'expense', '🏠', '#3483EB'),
    (new.id, 'Entertainment', 'expense', '🎮', '#9046FF');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
