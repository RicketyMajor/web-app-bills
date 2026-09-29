const HEADER = ["date", "description", "category", "type", "amount", "paid"];

// Spreadsheets run cells starting with these as formulas (CSV injection); a leading '
// is guarded too so the import (utils/csvImport.js) strips exactly one
const FORMULA = /^[=+\-@\t\r']/;

function cell(value) {
  let s = String(value ?? "");
  if (FORMULA.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

// Movements as CSV: BOM so Excel reads UTF-8 (accents, emojis); CRLF per RFC 4180
export function toCsv(rows) {
  const lines = rows.map((m) =>
    [m.date, m.description, m.categories.name, m.categories.type, Number(m.amount).toFixed(2), m.paid]
      .map(cell)
      .join(",")
  );
  return `\uFEFF${[HEADER.join(","), ...lines].map((line) => `${line}\r\n`).join("")}`;
}

// Browser only: saves the text through a temporary link
export function downloadCsv(filename, csv) {
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  a.click();
  // Next tick: revoking in the same tick can cancel the download in Safari/Firefox
  setTimeout(() => URL.revokeObjectURL(url));
}
