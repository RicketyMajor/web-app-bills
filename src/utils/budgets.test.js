import { test } from "node:test";
import assert from "node:assert/strict";
import { budgetFor, budgetRows, capFor, overrideMap, spentByMonth } from "./budgets.js";

const SEP = "2026-09-01";
const food = { id: 1, name: "Food", budget: "250.00", rollover: true };
const fun = { id: 2, name: "Fun", budget: 80, rollover: false };
const gifts = { id: 3, name: "Gifts", budget: null, rollover: true };
const none = new Map();

test("capFor: the month's override, else the base, else null", () => {
  const o = overrideMap([{ category_id: 2, month: SEP, amount: "120.00" }]);
  assert.equal(capFor(fun, SEP, o), 120);
  assert.equal(capFor(fun, "2026-10-01", o), 80);
  assert.equal(capFor(gifts, SEP, o), null);
});

test("spentByMonth splits the month and the month before", () => {
  const rows = [
    { amount: "10.10", date: "2026-09-02", category_id: 1 },
    { amount: "0.20", date: "2026-09-30", category_id: 1 },
    { amount: "220", date: "2026-08-31", category_id: 1 },
  ];
  const { spent, prevSpent } = spentByMonth(rows, SEP);
  assert.equal(spent.get(1), 10.3);
  assert.equal(prevSpent.get(1), 220);
});

test("budgetFor rolls last month's leftover or overspend into this month", () => {
  assert.deepEqual(budgetFor(food, SEP, none, new Map([[1, 220]])), { cap: 250, override: null, carry: 30, budget: 280 });
  assert.deepEqual(budgetFor(food, SEP, none, new Map([[1, 270]])), { cap: 250, override: null, carry: -20, budget: 230 });
  assert.equal(budgetFor(food, SEP, none, new Map()).budget, 500); // nothing spent last month
  assert.equal(budgetFor({ ...food, rollover: false }, SEP, none, new Map([[1, 220]])).budget, 250);
});

test("budgetFor: a category created this month rolls nothing in", () => {
  const fresh = { ...food, created_at: "2026-09-10T12:00:00+00:00" };
  assert.equal(budgetFor(fresh, SEP, none, new Map()).budget, 250);
  assert.equal(budgetFor({ ...food, created_at: "2026-08-20T12:00:00+00:00" }, SEP, none, new Map([[1, 100]])).budget, 400);
});

test("budgetFor: rollover uses last month's override, crosses the year, needs a cap", () => {
  const o = overrideMap([{ category_id: 3, month: "2026-12-01", amount: 400 }]);
  // Gifts: 400 in December only; January has no cap → no budget even with rollover
  assert.deepEqual(budgetFor(gifts, "2026-12-01", o, new Map()), { cap: 400, override: 400, carry: 0, budget: 400 });
  assert.equal(budgetFor(gifts, "2027-01-01", o, new Map([[3, 350]])), null);
  // Food in January rolls December (base 250, spent 200)
  assert.equal(budgetFor(food, "2027-01-01", none, new Map([[1, 200]])).budget, 300);
});

test("budgetRows: budgeted categories with spend, most at risk first; a budget <= 0 counts as full", () => {
  const cats = [food, fun, gifts, { id: 4, name: "Rent", budget: 100, rollover: true }];
  const spent = new Map([[1, 140], [2, 100]]);
  const prevSpent = new Map([[1, 220], [4, 300]]);
  const rows = budgetRows(cats, SEP, none, { spent, prevSpent });
  assert.deepEqual(
    rows.map(({ id, base, budget, spent, left, ratio }) => ({ id, base, budget, spent, left, ratio: +ratio.toFixed(3) })),
    [
      { id: 2, base: 80, budget: 80, spent: 100, left: -20, ratio: 1.25 },
      { id: 4, base: 100, budget: -100, spent: 0, left: -100, ratio: 1 },
      { id: 1, base: 250, budget: 280, spent: 140, left: 140, ratio: 0.5 },
    ]
  );
});
