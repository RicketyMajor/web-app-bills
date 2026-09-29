// Reads the app's own CSV export back (utils/csv.js writes it). Pure functions, tested.
const COLUMNS = ["date", "description", "category", "type", "amount", "paid"];
export const MAX_ROWS = 2000;
export const MAX_BYTES = 1024 * 1024;

// RFC 4180: quoted fields, "" escapes, commas and line breaks inside quotes. Drops blank lines.
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
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

// The export prefixes formula-like cells with ' (CSV injection guard); undo it
const unguard = (s) => (/^'[=+\-@\t\r]/.test(s) ? s.slice(1) : s);
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
  const [head = [], ...data] = parseCsv(text);
  const cols = head.map((h) => h.trim().toLowerCase());
  const missing = COLUMNS.filter((c) => !cols.includes(c));
  if (missing.length) return { fatal: `This isn't a Bills export: missing ${missing.join(", ")}.` };
  if (data.length === 0) return { fatal: "The file has no movements." };
  if (data.length > MAX_ROWS) return { fatal: `Import up to ${MAX_ROWS} movements at a time.` };

  const rows = [];
  const errors = [];
  data.forEach((cells, i) => {
    const line = i + 2; // header is row 1
    const result = readRow((name) => unguard((cells[cols.indexOf(name)] ?? "").trim()));
    if (typeof result === "string") errors.push({ line, message: result });
    else rows.push({ line, ...result });
  });
  return { rows, errors };
}

export const catKey = (type, name) => `${type}|${name.trim().toLowerCase()}`;
const dupKey = (date, amount, category, description) => `${date}|${Number(amount).toFixed(2)}|${category}|${description ?? ""}`;

// Categories by type + case-insensitive name; duplicates against existing movements and earlier rows.
// Rows of unknown categories can only duplicate each other (keyed by the unknown category).
export function planImport(rows, categories, existing) {
  const ids = new Map(categories.map((c) => [catKey(c.type, c.name), c.id]));
  const unknown = new Map();
  const seen = new Set(existing.map((m) => dupKey(m.date, m.amount, m.category_id, m.description)));
  const planned = rows.map((r) => {
    const key = catKey(r.type, r.category);
    const categoryId = ids.get(key) ?? null;
    if (categoryId === null && !unknown.has(key)) unknown.set(key, { key, name: r.category, type: r.type });
    const dup = dupKey(r.date, r.amount, categoryId ?? key, r.description);
    const duplicate = seen.has(dup);
    seen.add(dup);
    return { ...r, categoryId, unknownKey: categoryId === null ? key : null, duplicate };
  });
  return { rows: planned, unknown: [...unknown.values()] };
}

const choiceOf = (mapping, key) => mapping[key] ?? "new";

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
