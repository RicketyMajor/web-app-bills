// Dates travel as local 'YYYY-MM-DD' strings; never via toISOString (UTC shift)
export const isoDate = (d) => d.toLocaleDateString("en-CA");

const parse = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const monthStart = (d) => isoDate(new Date(d.getFullYear(), d.getMonth(), 1));

export const shiftMonth = (start, n) => {
  const d = parse(start);
  return isoDate(new Date(d.getFullYear(), d.getMonth() + n, 1));
};

export const monthLabel = (start) =>
  parse(start).toLocaleDateString("en-US", { month: "long", year: "numeric" });

export const shortDate = (date) =>
  parse(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });

// ponytail: sums client-side; move to a SQL view/RPC if monthly rows grow large
export function sumTotals(rows) {
  const cents = { income: 0, expense: 0 };
  for (const r of rows) cents[r.categories.type] += Math.round(Number(r.amount) * 100);
  return {
    income: cents.income / 100,
    expense: cents.expense / 100,
    balance: (cents.income - cents.expense) / 100,
  };
}
