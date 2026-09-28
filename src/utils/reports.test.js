import { test } from "node:test";
import assert from "node:assert/strict";
import { cumulativeByDay, lastMonths, monthlyTotals, totalsByCategory } from "./reports.js";

test("lastMonths ends at the given month, oldest first", () => {
  assert.deepEqual(lastMonths("2026-02-01", 3), ["2025-12-01", "2026-01-01", "2026-02-01"]);
});

test("monthlyTotals buckets by month and fills gaps with 0", () => {
  const rows = [
    { amount: "10.10", date: "2026-01-15", categories: { type: "income" } },
    { amount: "0.20", date: "2026-01-31", categories: { type: "income" } },
    { amount: "5.00", date: "2026-02-01", categories: { type: "expense" } },
  ];
  assert.deepEqual(monthlyTotals(rows, ["2025-12-01", "2026-01-01", "2026-02-01"]), [
    { month: "2025-12-01", income: 0, expense: 0 },
    { month: "2026-01-01", income: 10.3, expense: 0 },
    { month: "2026-02-01", income: 0, expense: 5 },
  ]);
});

test("totalsByCategory groups and ranks", () => {
  const food = { id: 1, name: "Food", icon: "🍔", color: "#FE6156", type: "expense" };
  const bus = { id: 2, name: "Transport", icon: "🚌", color: "#F9743B", type: "expense" };
  const rows = [
    { amount: "3.00", categories: bus },
    { amount: "2.50", categories: food },
    { amount: "2.50", categories: food },
  ];
  assert.deepEqual(totalsByCategory(rows), [
    { ...food, total: 5 },
    { ...bus, total: 3 },
  ]);
});

test("cumulativeByDay accumulates per day, carries empty days, splits months", () => {
  const rows = [
    { amount: "10.00", date: "2026-02-01" },
    { amount: "5.50", date: "2026-02-03" },
    { amount: "0.10", date: "2026-01-31" },
    { amount: "0.20", date: "2026-01-31" },
  ];
  const { current, previous, days } = cumulativeByDay(rows, "2026-02-01");
  assert.equal(days, 28);
  assert.equal(current.length, 28);
  assert.deepEqual(current.slice(0, 4), [10, 10, 15.5, 15.5]);
  assert.equal(current[27], 15.5);
  assert.equal(previous.length, 31);
  assert.equal(previous[29], 0);
  assert.equal(previous[30], 0.3);
});

test("cumulativeByDay stops the current month at today", () => {
  const { current, days } = cumulativeByDay([], "2026-09-01", "2026-09-27");
  assert.equal(days, 30);
  assert.equal(current.length, 27);
});

test("cumulativeByDay ignores a today outside the month", () => {
  assert.equal(cumulativeByDay([], "2026-04-01", "2026-09-27").current.length, 30);
});
