// The .js extension keeps this importable by `node --test`
import { shiftMonth } from "./movements.js";

const toCents = (amount) => Math.round(Number(amount) * 100);

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

export function totalsByCategory(rows) {
  const byId = new Map();
  for (const { amount, categories } of rows) {
    const entry = byId.get(categories.id) ?? { ...categories, cents: 0 };
    entry.cents += toCents(amount);
    byId.set(categories.id, entry);
  }
  return [...byId.values()]
    .map(({ cents, ...category }) => ({ ...category, total: cents / 100 }))
    .sort((a, b) => b.total - a.total);
}
