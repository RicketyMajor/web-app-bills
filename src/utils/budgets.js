// Monthly budgets per expense category: a base cap, optional one-month overrides and an
// optional rollover of last month's leftover (or overspend). Pure; the .js extension keeps
// it importable by `node --test`.
import { shiftMonth, toCents } from "./movements.js";

export const overrideKey = (categoryId, month) => `${categoryId}|${month}`;
const byCents = (map) => new Map([...map].map(([id, cents]) => [id, cents / 100]));

// budget_overrides rows → Map for capFor
export const overrideMap = (rows) => new Map(rows.map((o) => [overrideKey(o.category_id, o.month), Number(o.amount)]));

// A month's cap: its override, else the base budget; null = no budget that month
export function capFor(category, month, overrides) {
  return overrides.get(overrideKey(category.id, month)) ?? (category.budget ? Number(category.budget) : null);
}

// Spend per category in `month` and in the month before (rows cover only those two months)
export function spentByMonth(rows, month) {
  const current = month.slice(0, 7);
  const spent = new Map();
  const prevSpent = new Map();
  for (const r of rows) {
    const map = r.date.startsWith(current) ? spent : prevSpent;
    map.set(r.category_id, (map.get(r.category_id) ?? 0) + toCents(r.amount));
  }
  return { spent: byCents(spent), prevSpent: byCents(prevSpent) };
}

// Effective budget = cap + (rollover ? last month's cap − last month's spend : 0). null = no budget.
// A category created during `month` had no last month, so nothing rolls in.
// ponytail: last month's cap uses today's base (no base history); an override pins a month if it matters
export function budgetFor(category, month, overrides, prevSpent) {
  const cap = capFor(category, month, overrides);
  if (cap === null) return null;
  const existed = !category.created_at || category.created_at.slice(0, 10) < month;
  const prevCap = category.rollover && existed ? capFor(category, shiftMonth(month, -1), overrides) : null;
  const carry = prevCap === null ? 0 : (toCents(prevCap) - toCents(prevSpent.get(category.id) ?? 0)) / 100;
  return {
    cap,
    override: overrides.get(overrideKey(category.id, month)) ?? null,
    carry,
    budget: (toCents(cap) + toCents(carry)) / 100,
  };
}

// Budgeted categories for `month` with spend, most at risk first. A budget <= 0 (big overspend
// rolled in) reads as fully used.
export function budgetRows(categories, month, overrides, { spent, prevSpent }) {
  return categories
    .map((c) => [c, budgetFor(c, month, overrides, prevSpent)])
    .filter(([, b]) => b)
    .map(([c, b]) => {
      const s = spent.get(c.id) ?? 0;
      return {
        ...c,
        ...b,
        base: c.budget ? Number(c.budget) : null,
        spent: s,
        left: (toCents(b.budget) - toCents(s)) / 100,
        ratio: b.budget > 0 ? s / b.budget : 1,
      };
    })
    .sort((a, b) => b.ratio - a.ratio);
}
