-- Recurring movements (spec 15): rules that create pending movements automatically.
-- The client generates instances through the end of the current month (utils/recurring.js).
-- Run once in Supabase Dashboard -> SQL Editor BEFORE deploying the client that selects
-- movements.recurring_id.

create table public.recurring (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  category_id bigint not null,
  amount numeric(12, 2) not null constraint recurring_amount_positive check (amount > 0),
  description text constraint recurring_description_length check (length(description) <= 200),
  frequency text not null constraint recurring_frequency check (frequency in ('weekly', 'monthly', 'yearly')),
  -- First due date: gives the weekday, the day of the month, or the day and month
  anchor date not null,
  -- Last date already generated; the client never generates on or before it,
  -- so deleted or skipped instances don't come back
  generated_through date not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (category_id, user_id) references public.categories (id, user_id) on delete cascade
);

create index recurring_user_id_idx on public.recurring (user_id);

alter table public.recurring enable row level security;

create policy "Own recurring" on public.recurring
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Instances: ordinary movements that remember their rule. Deleting the rule keeps them.
alter table public.movements
  add column recurring_id bigint,
  add constraint movements_recurring_fk foreign key (recurring_id, user_id)
    references public.recurring (id, user_id) on delete set null (recurring_id),
  -- One instance per rule and date. Plain unique (not partial) so PostgREST's
  -- on_conflict can target it; NULLs are distinct, so plain movements never collide.
  add constraint movements_recurring_date_key unique (recurring_id, date);
