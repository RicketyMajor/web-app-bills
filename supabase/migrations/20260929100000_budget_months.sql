-- Budgets across months (spec 18): optional rollover per category and one-month overrides.
-- Effective budget = cap(month) + (rollover ? last month's cap - last month's spend : 0),
-- cap = override ?? categories.budget. Computed in the client (utils/budgets.js).
-- Run once in Supabase Dashboard -> SQL Editor BEFORE deploying the client that selects
-- categories.rollover.

alter table public.categories
  add column rollover boolean not null default false;

create table public.budget_overrides (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  category_id bigint not null,
  month date not null constraint budget_overrides_month_start check (extract(day from month) = 1),
  amount numeric(12, 2) not null constraint budget_overrides_amount_positive check (amount > 0),
  unique (category_id, month),
  foreign key (category_id, user_id) references public.categories (id, user_id) on delete cascade
);

alter table public.budget_overrides enable row level security;

create policy "Own budget overrides" on public.budget_overrides
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
