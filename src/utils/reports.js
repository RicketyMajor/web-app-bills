// The .js extension keeps this importable by `node --test`
import { shiftMonth, toCents } from "./movements.js";

export const lastMonths = (month, n) =>
  Array.from({ length: n }, (_, i) => shiftMonth(month, i - n + 1));

export function monthlyTotals(rows, months) {
  const cents = Object.fromEntries(months.map((m) => [m, { income: 0, expense: 0 }]));
  for (const r of rows) {
    const bucket = cents[`${r.date.slice(0, 7)}-01`];
    if (bucket) bucket[r.categories.type] += toCents(r.amount);
  }
  return months.map((m) => ({
    month: m,
    income: cents[m].income / 100,
    expense: cents[m].expense / 100,
  }));
}

const daysIn = (month) => new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0).getDate();

// Running spend per day for `month` and the month before (index 0 = day 1).
// When `today` falls in `month`, the current series stops there (no flat future).
export function cumulativeByDay(rows, month, today) {
  const series = (start) => {
    const cents = Array(daysIn(start)).fill(0);
    const prefix = start.slice(0, 7);
    for (const r of rows) if (r.date.startsWith(prefix)) cents[Number(r.date.slice(8, 10)) - 1] += toCents(r.amount);
    let sum = 0;
    return cents.map((c) => (sum += c) / 100);
  };
  const days = daysIn(month);
  const cut = today?.startsWith(month.slice(0, 7)) ? Number(today.slice(8, 10)) : days;
  return { current: series(month).slice(0, cut), previous: series(shiftMonth(month, -1)), days };
}

// This month's total per category, ranked, with the change vs last month.
// When `today` is inside `month`, last month only counts up to the same day (same stretch).
export function totalsByCategory(rows, month, today) {
  const current = month.slice(0, 7);
  const previous = shiftMonth(month, -1).slice(0, 7);
  const cutDay = today?.startsWith(current) ? today.slice(8, 10) : "31";
  const byId = new Map();
  for (const { amount, date, categories } of rows) {
    const entry = byId.get(categories.id) ?? { ...categories, cents: 0, prevCents: 0 };
    if (date.startsWith(current)) entry.cents += toCents(amount);
    else if (date.startsWith(previous) && date.slice(8, 10) <= cutDay) entry.prevCents += toCents(amount);
    byId.set(categories.id, entry);
  }
  return [...byId.values()]
    .filter((e) => e.cents > 0)
    .map(({ cents, prevCents, ...category }) => ({
      ...category,
      total: cents / 100,
      delta: prevCents ? (cents - prevCents) / prevCents : "new",
    }))
    .sort((a, b) => b.total - a.total);
}

// What the deltas compare against: "Aug 1–28" mid-month, "Aug" for a closed month
export function compareLabel(month, today) {
  const previous = shiftMonth(month, -1);
  const name = new Date(`${previous}T00:00`).toLocaleDateString("en-US", { month: "short" });
  if (!today?.startsWith(month.slice(0, 7))) return name;
  return `${name} 1–${Math.min(Number(today.slice(8, 10)), daysIn(previous))}`;
}

// Home hero: measure against the total budget when set, otherwise against income
export function heroReference({ income, expense }, budget) {
  const byBudget = Number(budget) > 0;
  const base = byBudget ? Number(budget) : income;
  const left = (toCents(base) - toCents(expense)) / 100;
  return { byBudget, base, left, over: left < 0, ratio: base > 0 ? expense / base : null };
}
