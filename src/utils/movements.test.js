import { test } from "node:test";
import assert from "node:assert/strict";
import { monthStart, shiftMonth, sumTotals } from "./movements.js";

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
