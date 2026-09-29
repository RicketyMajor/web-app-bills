// Reads the app's own CSV export back (utils/csv.js writes it). Pure functions, tested.
const COLUMNS = ["date", "description", "category", "type", "amount", "paid"];
export const MAX_ROWS = 2000;
export const MAX_BYTES = 1024 * 1024;

// RFC 4180: quoted fields, "" escapes, commas and line breaks inside quotes. Blank lines stay (as [""]) so row numbers match the file.
export function parseCsv(text) {
  const s = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quoted) {
      if (c === '"' && s[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && s[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (cell !== "" || row.length) rows.push([...row, cell]);
  return rows;
}

// The export prefixes cells starting with a formula character or ' with ' (CSV injection guard); undo it
const unguard = (s) => (/^'[=+\-@\t\r']/.test(s) ? s.slice(1) : s);
const chars = (s) => [...s].length; // code points, like Postgres length()

function isRealDate(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

// A valid row, or the first problem as a message
function readRow(get) {
  const date = get("date");
  if (!isRealDate(date)) return "date must be a real date written YYYY-MM-DD";
  const amount = get("amount");
  if (!/^\d{1,10}(\.\d{1,2})?$/.test(amount) || Number(amount) <= 0)
    return "amount must be greater than 0, with up to 2 decimals";
  const type = get("type").toLowerCase();
  if (type !== "income" && type !== "expense") return "type must be income or expense";
  const category = get("category");
  if (chars(category) < 1 || chars(category) > 50) return "category must have 1 to 50 characters";
  const paid = get("paid").toLowerCase();
  if (!["", "true", "false"].includes(paid)) return "paid must be true or false";
  const description = get("description");
  if (chars(description) > 200) return "description must have 200 characters or fewer";
  return { date, description: description || null, category, type, amount: Number(amount), paid: paid !== "false" };
}

export function readRows(text) {
  const [head = [], ...records] = parseCsv(text);
  const cols = head.map((h) => h.trim().toLowerCase());
  const missing = COLUMNS.filter((c) => !cols.includes(c));
  if (missing.length) return { fatal: `This isn't a Bills export: missing ${missing.join(", ")}.` };
  // [cells, row number]: header is row 1; blank lines count but aren't data
  const data = records.map((cells, i) => [cells, i + 2]).filter(([cells]) => cells.some((c) => c.trim() !== ""));
  if (data.length === 0) return { fatal: "The file has no movements." };
  if (data.length > MAX_ROWS) return { fatal: `Import up to ${MAX_ROWS} movements at a time.` };

  const rows = [];
  const errors = [];
  data.forEach(([cells, line]) => {
    const result = readRow((name) => unguard((cells[cols.indexOf(name)] ?? "").trim()));
    if (typeof result === "string") errors.push({ line, message: result });
    else rows.push({ line, ...result });
  });
  return { rows, errors };
}

export const catKey = (type, name) => `${type}|${name.trim().toLowerCase()}`;
const dupKey = (date, amount, category, description) => `${date}|${Number(amount).toFixed(2)}|${category}|${description ?? ""}`;

const choiceOf = (mapping, key) => mapping[key] ?? "new";

// Categories by type + case-insensitive name (unknown ones resolved through mapping).
// Each existing movement marks at most one row as its duplicate, so two identical
// coffees in the file with one already saved leave the second one checked.
export function planImport(rows, categories, existing, mapping = {}) {
  const ids = new Map(categories.map((c) => [catKey(c.type, c.name), c.id]));
  const names = new Map(categories.map((c) => [c.id, c.name]));
  const unknown = new Map();
  const left = new Map(); // duplicate key → existing movements not matched yet
  for (const m of existing) {
    const k = dupKey(m.date, m.amount, m.category_id, m.description);
    left.set(k, (left.get(k) ?? 0) + 1);
  }
  const planned = rows.map((r) => {
    const key = catKey(r.type, r.category);
    const categoryId = ids.get(key) ?? null;
    if (categoryId === null && !unknown.has(key)) unknown.set(key, { key, name: r.category, type: r.type });
    const choice = categoryId === null ? choiceOf(mapping, key) : null;
    const target = categoryId ?? (choice === "new" ? null : Number(choice));
    const dup = dupKey(r.date, r.amount, target, r.description);
    const duplicate = target !== null && (left.get(dup) ?? 0) > 0;
    if (duplicate) left.set(dup, left.get(dup) - 1);
    const categoryName = names.get(target) ?? r.category;
    return { ...r, categoryId, unknownKey: categoryId === null ? key : null, categoryName, duplicate };
  });
  return { rows: planned, unknown: [...unknown.values()] };
}

// Unknown categories set to "new" that at least one selected row uses
export function categoriesToCreate(plan, selected, mapping) {
  const used = new Set(plan.rows.filter((r) => selected.has(r.line) && r.unknownKey).map((r) => r.unknownKey));
  return plan.unknown.filter((u) => used.has(u.key) && choiceOf(mapping, u.key) === "new").map(({ name, type }) => ({ name, type }));
}

// created: catKey → id of the categories just inserted
export function movementsToInsert(plan, selected, mapping, created) {
  return plan.rows
    .filter((r) => selected.has(r.line))
    .map((r) => {
      const choice = r.unknownKey && choiceOf(mapping, r.unknownKey);
      const category_id = r.categoryId ?? (choice === "new" ? created.get(r.unknownKey) : Number(choice));
      return { category_id, amount: r.amount, date: r.date, description: r.description, paid: r.paid };
    });
}
