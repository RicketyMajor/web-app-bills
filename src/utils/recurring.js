// The .js extension keeps this importable by `node --test`
import { isoDate, parseDate } from "./movements.js";

const DAY = 86400000;
// Missed periods are created up to this many months back (spec 15)
const CATCH_UP_MONTHS = 12;

const ymd = (y, m, d) => isoDate(new Date(y, m, d));
// Day `day` of month `m` (0-based, may overflow into the next year), or the month's last day
const clamped = (y, m, day) => ymd(y, m, Math.min(day, new Date(y, m + 1, 0).getDate()));

// First due date strictly after `after` ('YYYY-MM-DD'); the anchor itself while it's still ahead
export function nextDue({ frequency, anchor }, after) {
  if (after < anchor) return anchor;
  const a = parseDate(anchor);
  const t = parseDate(after);
  if (frequency === "weekly") {
    // round: a DST day is 23 or 25 hours long
    const weeks = Math.floor(Math.round((t - a) / DAY) / 7) + 1;
    return ymd(a.getFullYear(), a.getMonth(), a.getDate() + weeks * 7);
  }
  if (frequency === "monthly") {
    const same = clamped(t.getFullYear(), t.getMonth(), a.getDate());
    return same > after ? same : clamped(t.getFullYear(), t.getMonth() + 1, a.getDate());
  }
  const same = clamped(t.getFullYear(), a.getMonth(), a.getDate());
  return same > after ? same : clamped(t.getFullYear() + 1, a.getMonth(), a.getDate());
}

// Due dates in (generated_through, through], never before the catch-up window
export function dueDates(rule, through, today) {
  const t = parseDate(today);
  const windowStart = ymd(t.getFullYear(), t.getMonth() - CATCH_UP_MONTHS, 0); // day before the window
  const after = rule.generated_through > windowStart ? rule.generated_through : windowStart;
  const dates = [];
  for (let d = nextDue(rule, after); d <= through; d = nextDue(rule, d)) dates.push(d);
  return dates;
}

// What the sync writes: pending movements through the end of today's month, and the rules
// (ids) whose generated_through moves to that month end (through)
export function instancesToCreate(rules, today) {
  const t = parseDate(today);
  const through = ymd(t.getFullYear(), t.getMonth() + 1, 0);
  const inserts = [];
  const ids = [];
  for (const rule of rules) {
    if (!rule.active || rule.generated_through >= through) continue;
    for (const date of dueDates(rule, through, today))
      inserts.push({
        recurring_id: rule.id,
        category_id: rule.category_id,
        amount: rule.amount,
        description: rule.description,
        date,
        paid: false,
      });
    ids.push(rule.id);
  }
  return { inserts, ids, through };
}

const ordinal = (n) => {
  const suffix = n % 100 >= 11 && n % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] ?? "th";
  return `${n}${suffix}`;
};

// "Every Monday" / "Every month on the 5th" / "Every year on Mar 5"
export function repeatLabel(frequency, anchor) {
  const d = parseDate(anchor);
  if (frequency === "weekly") return `Every ${d.toLocaleDateString("en-US", { weekday: "long" })}`;
  if (frequency === "monthly") return `Every month on the ${ordinal(d.getDate())}`;
  return `Every year on ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

// Resuming skips what fell due while paused, but never regenerates dates already created
export function resumeThrough(generatedThrough, today) {
  const t = parseDate(today);
  const yesterday = ymd(t.getFullYear(), t.getMonth(), t.getDate() - 1);
  return generatedThrough > yesterday ? generatedThrough : yesterday;
}
