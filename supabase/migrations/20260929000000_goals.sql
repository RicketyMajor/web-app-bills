-- Savings goals (spec 16): a target, an optional deadline and manual contributions.
-- Saved = sum of contributions (computed in the client); withdrawals are negative amounts.
-- Goals are independent of movements, categories and budgets.
-- Run once in Supabase Dashboard -> SQL Editor BEFORE deploying the client that queries goals.

create table public.goals (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  name text not null constraint goals_name_length check (length(trim(name)) between 1 and 50),
  icon text not null default '🎯' constraint goals_icon_length check (char_length(icon) between 1 and 16),
  target numeric(12, 2) not null constraint goals_target_positive check (target > 0),
  deadline date,
  created_at timestamptz not null default now(),
  unique (id, user_id)
);

create table public.goal_contributions (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  goal_id bigint not null,
  -- Negative = withdrawal; the client keeps saved from going below zero
  amount numeric(12, 2) not null constraint goal_contributions_amount_nonzero check (amount <> 0),
  date date not null default current_date,
  note text constraint goal_contributions_note_length check (length(note) <= 200),
  created_at timestamptz not null default now(),
  foreign key (goal_id, user_id) references public.goals (id, user_id) on delete cascade
);

create index goals_user_id_idx on public.goals (user_id);
create index goal_contributions_goal_id_idx on public.goal_contributions (goal_id);

alter table public.goals enable row level security;
alter table public.goal_contributions enable row level security;

create policy "Own goals" on public.goals
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Own goal contributions" on public.goal_contributions
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
