import { test } from "node:test";
import assert from "node:assert/strict";
import { budgetRows, cumulativeByDay, heroReference, lastMonths, monthlyTotals, totalsByCategory } from "./reports.js";

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

test("budgetRows joins budgets with spend, most at risk first", () => {
  const cats = [
    { id: 1, name: "Food", budget: 300 },
    { id: 2, name: "Bus", budget: 150 },
    { id: 3, name: "Fun", budget: null },
    { id: 4, name: "Gym", budget: "40.00" },
  ];
  const breakdown = [{ id: 1, total: 320.1 }, { id: 2, total: 90 }, { id: 3, total: 140 }];
  assert.deepEqual(
    budgetRows(cats, breakdown).map(({ id, spent, left, ratio }) => ({ id, spent, left, ratio: +ratio.toFixed(3) })),
    [
      { id: 1, spent: 320.1, left: -20.1, ratio: 1.067 },
      { id: 2, spent: 90, left: 60, ratio: 0.6 },
      { id: 4, spent: 0, left: 40, ratio: 0 },
    ]
  );
});

test("heroReference prefers the budget, falls back to income", () => {
  assert.deepEqual(heroReference({ income: 2000, expense: 820 }, 1000), {
    byBudget: true, base: 1000, left: 180, over: false, ratio: 0.82,
  });
  assert.deepEqual(heroReference({ income: 500, expense: 700.1 }, null), {
    byBudget: false, base: 500, left: -200.1, over: true, ratio: 700.1 / 500,
  });
  assert.equal(heroReference({ income: 0, expense: 10 }, null).ratio, null);
});
