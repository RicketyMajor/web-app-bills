import { test } from "node:test";
import assert from "node:assert/strict";
import { activeFilterCount, dueLabel, filterMovements, monthStart, shiftMonth, shortDate, sumTotals } from "./movements.js";

test("monthStart uses local time", () => {
  assert.equal(monthStart(new Date(2026, 8, 30, 23, 59)), "2026-09-01");
});

test("shiftMonth crosses year boundaries", () => {
  assert.equal(shiftMonth("2026-12-01", 1), "2027-01-01");
  assert.equal(shiftMonth("2026-01-01", -1), "2025-12-01");
});

test("sumTotals adds in cents (no float drift)", () => {
  const rows = [
    { amount: "0.10", categories: { type: "income" } },
    { amount: "0.20", categories: { type: "income" } },
    { amount: "1.00", categories: { type: "expense" } },
  ];
  assert.deepEqual(sumTotals(rows), { income: 0.3, expense: 1, balance: -0.7 });
});

test("dueLabel counts calendar days from today", () => {
  const today = "2026-09-28";
  assert.deepEqual(dueLabel("2026-09-25", today), { text: "3 days late", late: true });
  assert.deepEqual(dueLabel("2026-09-27", today), { text: "1 day late", late: true });
  assert.deepEqual(dueLabel("2026-09-28", today), { text: "Today", late: false });
  assert.deepEqual(dueLabel("2026-09-29", today), { text: "Tomorrow", late: false });
  assert.deepEqual(dueLabel("2026-10-11", today), { text: "In 13 days", late: false });
  assert.deepEqual(dueLabel("2026-10-12", today), { text: "Oct 12", late: false });
});

test("dueLabel survives the DST change", () => {
  assert.equal(dueLabel("2026-04-06", "2026-04-04").text, "In 2 days");
});

test("shortDate adds the year only outside the current year", () => {
  const year = new Date().getFullYear();
  assert.equal(shortDate(`${year}-03-05`), "Mar 5");
  assert.equal(shortDate("2020-03-05"), "Mar 5, 2020");
  assert.equal(shortDate("2026-10-12", "2027-01-02"), "Oct 12, 2026");
});

const mv = (id, amount, description, name, paid = true, category_id = id) => ({
  id, amount, description, paid, category_id, categories: { name },
});
const sample = [
  mv(1, "12.50", "Café con leche", "Eating out"),
  mv(2, "80.00", null, "Dentist", false),
  mv(3, "10.00", "Bus card", "Transport"),
];
const none = { q: "", cat: "", status: "", min: "", max: "" };
const ids = (rows) => rows.map((r) => r.id);

test("filterMovements matches text in description or category, ignoring case and accents", () => {
  assert.deepEqual(ids(filterMovements(sample, { ...none, q: " cafe " })), [1]);
  assert.deepEqual(ids(filterMovements(sample, { ...none, q: "DENT" })), [2]);
  assert.deepEqual(ids(filterMovements(sample, none)), [1, 2, 3]);
});

test("filterMovements combines category, status and an inclusive amount range", () => {
  assert.deepEqual(ids(filterMovements(sample, { ...none, cat: "3" })), [3]);
  assert.deepEqual(ids(filterMovements(sample, { ...none, status: "pending" })), [2]);
  assert.deepEqual(ids(filterMovements(sample, { ...none, status: "paid" })), [1, 3]);
  assert.deepEqual(ids(filterMovements(sample, { ...none, min: "10", max: "12.5" })), [1, 3]);
  assert.deepEqual(ids(filterMovements(sample, { ...none, status: "paid", min: "11" })), [1]);
  assert.deepEqual(ids(filterMovements(sample, { ...none, min: "abc" })), [1, 2, 3]);
});

test("activeFilterCount counts the range once and ignores the search text", () => {
  assert.equal(activeFilterCount({ cat: "", status: "", min: "", max: "", all: "" }), 0);
  assert.equal(activeFilterCount({ cat: "4", status: "paid", min: "5", max: "9", all: "1" }), 4);
  assert.equal(activeFilterCount({ cat: "", status: "", min: "", max: "20", all: "" }), 1);
  assert.equal(activeFilterCount({ cat: "", status: "", min: "abc", max: "", all: "" }), 0);
});
