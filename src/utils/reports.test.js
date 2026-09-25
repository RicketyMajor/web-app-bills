import { test } from "node:test";
import assert from "node:assert/strict";
import { lastMonths, monthlyTotals, totalsByCategory } from "./reports.js";

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
