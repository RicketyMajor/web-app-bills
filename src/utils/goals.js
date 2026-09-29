// The .js extension keeps this importable by `node --test`
import { parseDate, toCents } from "./movements.js";

// Saved so far, what's left, and the monthly pace to an optional deadline (spec 16). today: 'YYYY-MM-DD'
export function goalProgress(goal, today) {
  const savedCents = goal.goal_contributions.reduce((sum, c) => sum + toCents(c.amount), 0);
  const targetCents = toCents(goal.target);
  const reached = savedCents >= targetCents;
  const leftCents = Math.max(0, targetCents - savedCents);
  const overdue = !!goal.deadline && goal.deadline < today && !reached;
  let perMonth = null;
  if (goal.deadline && !reached && goal.deadline >= today) {
    const d = parseDate(goal.deadline);
    const t = parseDate(today);
    // Month steps from now to the deadline; this month counts as one when it's due this month
    const months = Math.max(1, (d.getFullYear() - t.getFullYear()) * 12 + d.getMonth() - t.getMonth());
    perMonth = Math.ceil(leftCents / months) / 100; // round up: the pace must get there
  }
  return {
    saved: savedCents / 100,
    left: leftCents / 100,
    ratio: savedCents / targetCents,
    // Integer math: 0.57 * 100 is 56.99… in floating point
    percent: Math.floor((savedCents * 100) / targetCents),
    reached,
    perMonth,
    overdue,
  };
}

const byCreated = (a, b) => a.goal.created_at.localeCompare(b.goal.created_at);

// Active goals by deadline (soonest first, none last, then oldest); reached ones after, oldest first
export function sortGoals(goals, today) {
  const rows = goals.map((goal) => ({ goal, progress: goalProgress(goal, today) }));
  const deadlineKey = (x) => x.goal.deadline ?? "9999-12-31";
  return {
    active: rows
      .filter((x) => !x.progress.reached)
      .sort((a, b) => deadlineKey(a).localeCompare(deadlineKey(b)) || byCreated(a, b)),
    reached: rows.filter((x) => x.progress.reached).sort(byCreated),
  };
}

// "$190.00/month to reach it by Mar 2027" | "Past its date" | "" (no deadline, or reached)
export function paceLabel({ perMonth, overdue }, deadline, money) {
  if (overdue) return "Past its date";
  if (perMonth === null) return "";
  const by = parseDate(deadline).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  return `${money(perMonth)}/month to reach it by ${by}`;
}

export const historyOf = (goal) =>
  [...goal.goal_contributions].sort(
    (a, b) => b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at)
  );

// A withdrawal can't take out more than what's saved
export const canWithdraw = (saved, amount) => toCents(amount) > 0 && toCents(amount) <= toCents(saved);

// Deleting a contribution can't leave saved below zero (e.g. the deposit behind a later withdrawal)
export const canRemove = (saved, amount) => toCents(saved) - toCents(amount) >= 0;
