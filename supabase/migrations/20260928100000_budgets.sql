-- Budgets: an optional fixed monthly cap per expense category and an optional
-- monthly total on the profile. null = no budget.
-- Run once in Supabase Dashboard -> SQL Editor, BEFORE deploying the budget editors
-- (the client selects these columns). Existing RLS policies cover them.

alter table public.categories
  add column budget numeric(12, 2),
  add constraint categories_budget_positive check (budget > 0),
  -- Budgets only make sense for spending
  add constraint categories_budget_expense_only check (budget is null or type = 'expense');

alter table public.profiles
  add column monthly_budget numeric(12, 2),
  add constraint profiles_monthly_budget_positive check (monthly_budget > 0);
