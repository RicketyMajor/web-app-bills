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
