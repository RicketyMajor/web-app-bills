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

// "Sep 24"; other years add it: "Mar 5, 2020"
export const shortDate = (date) => {
  const d = parse(date);
  const year = d.getFullYear() === new Date().getFullYear() ? undefined : "numeric";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year });
};

// When a pending movement is due, relative to today. Neutral words: works for bills and expected income.
export function dueLabel(date, today) {
  // round: a DST day is 23 or 25 hours long
  const days = Math.round((parse(date) - parse(today)) / 86400000);
  if (days < 0) return { text: `${-days} day${days === -1 ? "" : "s"} late`, late: true };
  if (days === 0) return { text: "Today", late: false };
  if (days === 1) return { text: "Tomorrow", late: false };
  if (days < 14) return { text: `In ${days} days`, late: false };
  return { text: shortDate(date), late: false };
}

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

// Lowercase without accents: "Café" matches "cafe"
const fold = (s) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
const cents = (amount) => Math.round(Number(amount) * 100);

// Movements filters (URL params as strings; "" = off). All of them must match.
export function filterMovements(rows, { q = "", cat = "", status = "", min = "", max = "" }) {
  const needle = fold(q.trim());
  return rows.filter(
    (m) =>
      (!needle || fold(`${m.description ?? ""} ${m.categories.name}`).includes(needle)) &&
      (!cat || m.category_id === Number(cat)) &&
      (!status || m.paid === (status === "paid")) &&
      (min === "" || cents(m.amount) >= cents(min)) &&
      (max === "" || cents(m.amount) <= cents(max))
  );
}

// "Filters (N)": the search box is always visible, so it isn't counted; min–max is one filter
export const activeFilterCount = ({ cat, status, min, max, all }) =>
  [cat, status, min || max, all === "1"].filter(Boolean).length;
