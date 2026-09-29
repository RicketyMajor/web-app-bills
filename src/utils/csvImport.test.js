import { test } from "node:test";
import assert from "node:assert/strict";
import { toCsv } from "./csv.js";
import { categoriesToCreate, movementsToInsert, parseCsv, planImport, readRows } from "./csvImport.js";

const BOM = String.fromCharCode(0xfeff);
const HEAD = "date,description,category,type,amount,paid";
const csv = (...lines) => [HEAD, ...lines].join("\r\n");

test("parseCsv handles quotes, escaped quotes, line breaks, BOM and blank lines", () => {
  assert.deepEqual(parseCsv(`${BOM}a,"b,c","say ""hi""\nbye"\r\n\r\nd,,e\n`), [
    ["a", "b,c", 'say "hi"\nbye'],
    ["d", "", "e"],
  ]);
});

test("readRows reads the export back (round trip)", () => {
  const movement = { date: "2026-09-24", description: "=SUM(A1)", amount: "92.5", paid: false, categories: { name: "Groceries", type: "expense" } };
  const { rows, errors } = readRows(toCsv([movement, { ...movement, description: null, paid: true }]));
  assert.deepEqual(errors, []);
  assert.deepEqual(rows, [
    { line: 2, date: "2026-09-24", description: "=SUM(A1)", category: "Groceries", type: "expense", amount: 92.5, paid: false },
    { line: 3, date: "2026-09-24", description: null, category: "Groceries", type: "expense", amount: 92.5, paid: true },
  ]);
});

test("readRows accepts any column order, header case and an empty paid", () => {
  const { rows } = readRows("Amount,TYPE,category,date,paid,description\n10,Income,Salary,2026-01-31,,Jan");
  assert.deepEqual(rows[0], { line: 2, date: "2026-01-31", description: "Jan", category: "Salary", type: "income", amount: 10, paid: true });
});

test("readRows reports invalid rows with their spreadsheet row number", () => {
  const { rows, errors } = readRows(
    csv(
      "2026-02-30,x,Food,expense,5,true",
      "2026-02-01,x,Food,expense,-5,true",
      "2026-02-01,x,Food,expense,5.555,true",
      "2026-02-01,x,Food,transfer,5,true",
      "2026-02-01,x,,expense,5,true",
      "2026-02-01,x,Food,expense,5,yes",
      "2026-02-01,x,Food,expense,5,TRUE"
    )
  );
  assert.deepEqual(errors.map((e) => e.line), [2, 3, 4, 5, 6, 7]);
  assert.match(errors[0].message, /date/);
  assert.match(errors[1].message, /amount/);
  assert.match(errors[3].message, /type/);
  assert.match(errors[4].message, /category/);
  assert.match(errors[5].message, /paid/);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].line, 8);
});

test("readRows counts characters like Postgres (emoji = 1)", () => {
  const long = "😀".repeat(200);
  assert.equal(readRows(csv(`2026-02-01,${long},Food,expense,5,true`)).rows.length, 1);
  assert.equal(readRows(csv(`2026-02-01,${long}x,Food,expense,5,true`)).errors.length, 1);
});

test("readRows rejects files that aren't an export", () => {
  assert.match(readRows("date,amount\n2026-01-01,5").fatal, /description, category, type, paid/);
  assert.match(readRows("").fatal, /missing/);
  assert.match(readRows(HEAD).fatal, /no movements/);
  const many = Array.from({ length: 2001 }, () => "2026-01-01,,Food,expense,1,true");
  assert.match(readRows(csv(...many)).fatal, /2000/);
});

const cats = [
  { id: 1, name: "Groceries", type: "expense" },
  { id: 2, name: "Salary", type: "income" },
];
const row = (over) => ({ line: 2, date: "2026-09-01", description: null, category: "Groceries", type: "expense", amount: 10, paid: true, ...over });

test("planImport matches categories by type and case-insensitive name", () => {
  const plan = planImport(
    [row({ category: " groceries " }), row({ line: 3, category: "Pets" }), row({ line: 4, category: "pets" }), row({ line: 5, category: "Groceries", type: "income" })],
    cats,
    []
  );
  assert.deepEqual(plan.rows.map((r) => r.categoryId), [1, null, null, null]);
  assert.deepEqual(plan.unknown, [
    { key: "expense|pets", name: "Pets", type: "expense" },
    { key: "income|groceries", name: "Groceries", type: "income" },
  ]);
});

test("planImport flags duplicates of existing movements and earlier rows", () => {
  const existing = [{ date: "2026-09-01", amount: "10.00", category_id: 1, description: null }];
  const plan = planImport(
    [row(), row({ line: 3, description: "a" }), row({ line: 4, description: "a" }), row({ line: 5, category: "Pets" }), row({ line: 6, category: "PETS" })],
    cats,
    existing
  );
  assert.deepEqual(plan.rows.map((r) => r.duplicate), [true, false, true, false, true]);
});

test("categoriesToCreate / movementsToInsert follow the selection and the mapping", () => {
  const plan = planImport([row(), row({ line: 3, category: "Pets" }), row({ line: 4, category: "Toys", description: "ball" })], cats, []);
  const selected = new Set([3, 4]);
  const mapping = { "expense|toys": "1" };
  assert.deepEqual(categoriesToCreate(plan, selected, mapping), [{ name: "Pets", type: "expense" }]);
  assert.deepEqual(categoriesToCreate(plan, new Set([2]), {}), []);
  assert.deepEqual(movementsToInsert(plan, selected, mapping, new Map([["expense|pets", 9]])), [
    { category_id: 9, amount: 10, date: "2026-09-01", description: null, paid: true },
    { category_id: 1, amount: 10, date: "2026-09-01", description: "ball", paid: true },
  ]);
});
