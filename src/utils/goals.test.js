import { test } from "node:test";
import assert from "node:assert/strict";
import { canRemove, canWithdraw, goalProgress, historyOf, paceLabel, sortGoals } from "./goals.js";

const goal = (over = {}) => ({
  id: 1,
  name: "Japan",
  icon: "✈️",
  target: "2000.00",
  deadline: null,
  created_at: "2026-01-01T00:00:00Z",
  goal_contributions: [],
  ...over,
});
const c = (amount, date = "2026-09-01", created_at = "2026-09-01T10:00:00Z") => ({
  id: created_at + amount,
  amount,
  date,
  note: null,
  created_at,
});

test("goalProgress sums contributions and withdrawals in cents", () => {
  const p = goalProgress(goal({ goal_contributions: [c("500.10"), c("0.20"), c("-100.00")] }), "2026-09-28");
  assert.equal(p.saved, 400.3);
  assert.equal(p.left, 1599.7);
  assert.equal(p.reached, false);
  assert.equal(p.perMonth, null);
  assert.equal(p.overdue, false);
});

test("goalProgress: past the target counts as reached with nothing left", () => {
  const p = goalProgress(goal({ target: "100", goal_contributions: [c("150")] }), "2026-09-28");
  assert.equal(p.reached, true);
  assert.equal(p.left, 0);
  assert.equal(p.ratio, 1.5);
});

test("perMonth splits what's left over the months to the deadline, rounding up", () => {
  const g = goal({ target: "1000", deadline: "2027-03-15", goal_contributions: [c("1")] });
  assert.equal(goalProgress(g, "2026-09-28").perMonth, 166.5); // 999 over 6 months
  assert.equal(goalProgress(goal({ target: "100", deadline: "2027-01-10" }), "2026-12-05").perMonth, 100); // across the year
  assert.equal(goalProgress(goal({ target: "100", deadline: "2026-09-30" }), "2026-09-28").perMonth, 100); // same month = 1
  assert.equal(goalProgress(goal({ target: "10", deadline: "2026-12-01" }), "2026-09-28").perMonth, 3.34); // 1000c / 3 → 334c
});

test("overdue once the deadline passes without reaching the target", () => {
  assert.equal(goalProgress(goal({ deadline: "2026-09-27" }), "2026-09-28").overdue, true);
  assert.equal(goalProgress(goal({ deadline: "2026-09-27" }), "2026-09-28").perMonth, null);
  assert.equal(
    goalProgress(goal({ deadline: "2026-09-27", target: "1", goal_contributions: [c("1")] }), "2026-09-28").overdue,
    false
  );
});

test("sortGoals: active by deadline (none last, then oldest), reached at the end", () => {
  const goals = [
    goal({ id: 1, created_at: "2026-01-01" }),
    goal({ id: 2, deadline: "2027-01-01", created_at: "2026-01-02" }),
    goal({ id: 3, deadline: "2026-12-01", created_at: "2026-01-03" }),
    goal({ id: 4, target: "1", goal_contributions: [c("1")], created_at: "2026-01-04" }),
    goal({ id: 5, created_at: "2025-12-01" }),
  ];
  const { active, reached } = sortGoals(goals, "2026-09-28");
  assert.deepEqual(
    active.map((x) => x.goal.id),
    [3, 2, 5, 1]
  );
  assert.deepEqual(
    reached.map((x) => x.goal.id),
    [4]
  );
});

test("paceLabel says the monthly pace, a missed date, or nothing", () => {
  const money = (n) => `$${n.toFixed(2)}`;
  const g = goal({ target: "1000", deadline: "2027-03-15", goal_contributions: [c("1")] });
  assert.equal(paceLabel(goalProgress(g, "2026-09-28"), g.deadline, money), "$166.50/month to reach it by Mar 2027");
  assert.equal(paceLabel(goalProgress(goal({ deadline: "2026-09-01" }), "2026-09-28"), "2026-09-01", money), "Past its date");
  assert.equal(paceLabel(goalProgress(goal(), "2026-09-28"), null, money), "");
});

test("canWithdraw and canRemove keep saved from going below zero", () => {
  assert.equal(canWithdraw(100, "100"), true);
  assert.equal(canWithdraw(100, "100.01"), false);
  assert.equal(canWithdraw(100, "0"), false);
  assert.equal(canRemove(100, "50"), true);
  assert.equal(canRemove(40, "50"), false);
  assert.equal(canRemove(40, "-10"), true);
});

test("historyOf lists newest first (date, then creation)", () => {
  const g = goal({
    goal_contributions: [
      c("1", "2026-08-01", "2026-08-01T09:00:00Z"),
      c("2", "2026-09-01", "2026-09-01T09:00:00Z"),
      c("3", "2026-09-01", "2026-09-01T10:00:00Z"),
    ],
  });
  assert.deepEqual(
    historyOf(g).map((x) => x.amount),
    ["3", "2", "1"]
  );
});
