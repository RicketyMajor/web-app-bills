import { test } from "node:test";
import assert from "node:assert/strict";
import { dueDates, instancesToCreate, nextDue, repeatLabel, resumeThrough } from "./recurring.js";

const rule = (over = {}) => ({
  id: 1,
  category_id: 3,
  amount: "850.00",
  description: "Rent",
  frequency: "monthly",
  anchor: "2026-01-31",
  generated_through: "2026-01-31",
  active: true,
  ...over,
});

test("nextDue: monthly clamps to the last day of shorter months", () => {
  const r = rule();
  assert.equal(nextDue(r, "2026-01-31"), "2026-02-28");
  assert.equal(nextDue(r, "2026-02-28"), "2026-03-31");
  assert.equal(nextDue(r, "2026-04-15"), "2026-04-30");
  assert.equal(nextDue(rule({ anchor: "2028-01-31" }), "2028-01-31"), "2028-02-29");
});

test("nextDue: returns the anchor while it is still ahead", () => {
  assert.equal(nextDue(rule({ anchor: "2026-10-05" }), "2026-09-30"), "2026-10-05");
});

test("nextDue: weekly steps 7 days across months and years", () => {
  const r = rule({ frequency: "weekly", anchor: "2026-12-21" });
  assert.equal(nextDue(r, "2026-12-21"), "2026-12-28");
  assert.equal(nextDue(r, "2026-12-28"), "2027-01-04");
  assert.equal(nextDue(r, "2026-12-30"), "2027-01-04");
});

test("nextDue: yearly keeps the day and month; Feb 29 falls on Feb 28", () => {
  const r = rule({ frequency: "yearly", anchor: "2028-02-29" });
  assert.equal(nextDue(r, "2028-02-29"), "2029-02-28");
  assert.equal(nextDue(r, "2031-06-01"), "2032-02-29");
  assert.equal(nextDue(rule({ frequency: "yearly", anchor: "2026-03-05" }), "2026-03-05"), "2027-03-05");
});

test("dueDates lists every date after generated_through up to through", () => {
  const r = rule({ frequency: "weekly", anchor: "2026-09-07", generated_through: "2026-09-30" });
  assert.deepEqual(dueDates(r, "2026-10-31", "2026-10-01"), ["2026-10-05", "2026-10-12", "2026-10-19", "2026-10-26"]);
  assert.deepEqual(dueDates(rule({ generated_through: "2026-10-31" }), "2026-10-31", "2026-10-01"), []);
});

test("dueDates catches up at most 12 months back", () => {
  const r = rule({ anchor: "2020-01-10", generated_through: "2020-01-10" });
  const dates = dueDates(r, "2026-10-31", "2026-10-15");
  assert.equal(dates[0], "2025-10-10");
  assert.equal(dates.at(-1), "2026-10-10");
  assert.equal(dates.length, 13);
});

test("instancesToCreate builds pending rows through month end and skips paused or covered rules", () => {
  const rules = [
    rule({ id: 1, anchor: "2026-09-05", generated_through: "2026-09-30" }),
    rule({ id: 2, active: false, generated_through: "2026-08-31" }),
    rule({ id: 3, generated_through: "2026-10-31" }),
  ];
  const { inserts, ids, through } = instancesToCreate(rules, "2026-10-02");
  assert.deepEqual(inserts, [
    { recurring_id: 1, category_id: 3, amount: "850.00", description: "Rent", date: "2026-10-05", paid: false },
  ]);
  assert.deepEqual(ids, [1]);
  assert.equal(through, "2026-10-31");
});

test("repeatLabel names the schedule", () => {
  assert.equal(repeatLabel("weekly", "2026-09-28"), "Every Monday");
  assert.equal(repeatLabel("monthly", "2026-09-01"), "Every month on the 1st");
  assert.equal(repeatLabel("monthly", "2026-09-22"), "Every month on the 22nd");
  assert.equal(repeatLabel("monthly", "2026-09-13"), "Every month on the 13th");
  assert.equal(repeatLabel("yearly", "2026-03-05"), "Every year on Mar 5");
});

test("resumeThrough never moves generated_through backwards", () => {
  assert.equal(resumeThrough("2026-08-31", "2026-10-15"), "2026-10-14");
  assert.equal(resumeThrough("2026-10-31", "2026-10-15"), "2026-10-31");
  assert.equal(resumeThrough("2026-09-30", "2026-10-01"), "2026-09-30");
});
