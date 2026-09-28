// Dates travel as local 'YYYY-MM-DD' strings; never via toISOString (UTC shift)
export const isoDate = (d) => d.toLocaleDateString("en-CA");

const parse = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
export { parse as parseDate };

export const monthStart = (d) => isoDate(new Date(d.getFullYear(), d.getMonth(), 1));

export const shiftMonth = (start, n) => {
  const d = parse(start);
  return isoDate(new Date(d.getFullYear(), d.getMonth() + n, 1));
};

export const monthLabel = (start) =>
  parse(start).toLocaleDateString("en-US", { month: "long", year: "numeric" });

export const toCents = (amount) => Math.round(Number(amount) * 100);

// "Sep 24"; outside today's year it adds it: "Mar 5, 2020"
export const shortDate = (date, today = isoDate(new Date())) =>
  parse(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.slice(0, 4) === today.slice(0, 4) ? undefined : "numeric",
  });

// When a pending movement is due, relative to today. Neutral words: works for bills and expected income.
export function dueLabel(date, today) {
  // round: a DST day is 23 or 25 hours long
  const days = Math.round((parse(date) - parse(today)) / 86400000);
  if (days < 0) return { text: `${-days} day${days === -1 ? "" : "s"} late`, late: true };
  if (days === 0) return { text: "Today", late: false };
  if (days === 1) return { text: "Tomorrow", late: false };
  if (days < 14) return { text: `In ${days} days`, late: false };
  return { text: shortDate(date, today), late: false };
}

// ponytail: sums client-side; move to a SQL view/RPC if monthly rows grow large
export function sumTotals(rows) {
  const cents = { income: 0, expense: 0 };
  for (const r of rows) cents[r.categories.type] += toCents(r.amount);
  return {
    income: cents.income / 100,
    expense: cents.expense / 100,
    balance: (cents.income - cents.expense) / 100,
  };
}

// Lowercase without accents: "Café" matches "cafe"
const fold = (s) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
// An amount bound in cents, or null when empty or not a number (hand-edited URL)
const bound = (s) => (s !== "" && Number.isFinite(Number(s)) ? toCents(s) : null);

// Movements filters (URL params as strings; "" = off). All of them must match.
export function filterMovements(rows, { q = "", cat = "", status = "", min = "", max = "" }) {
  const needle = fold(q.trim());
  const lo = bound(min);
  const hi = bound(max);
  return rows.filter(
    (m) =>
      (!needle || fold(`${m.description ?? ""} ${m.categories.name}`).includes(needle)) &&
      (!cat || m.category_id === Number(cat)) &&
      (!status || m.paid === (status === "paid")) &&
      (lo === null || toCents(m.amount) >= lo) &&
      (hi === null || toCents(m.amount) <= hi)
  );
}

// "Filters (N)": the search box is always visible, so it isn't counted; min–max is one filter
export const activeFilterCount = ({ cat, status, min, max, all }) =>
  [cat, status, bound(min) !== null || bound(max) !== null, all === "1"].filter(Boolean).length;
