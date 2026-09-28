import { test } from "node:test";
import assert from "node:assert/strict";
import { dueLabel, monthStart, shiftMonth, sumTotals } from "./movements.js";

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
