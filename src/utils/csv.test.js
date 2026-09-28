import { test } from "node:test";
import assert from "node:assert/strict";
import { toCsv } from "./csv.js";

const row = (over = {}) => ({
  date: "2026-09-24",
  description: "Weekly shop",
  amount: "92.5",
  paid: true,
  categories: { name: "Groceries", type: "expense" },
  ...over,
});
const HEAD = "\uFEFFdate,description,category,type,amount,paid\r\n";

test("toCsv writes a BOM, a header and CRLF rows", () => {
  assert.equal(toCsv([row()]), `${HEAD}2026-09-24,Weekly shop,Groceries,expense,92.50,true\r\n`);
  assert.equal(toCsv([]), HEAD);
  assert.equal(toCsv([]).charCodeAt(0), 0xfeff);
});

test("toCsv quotes commas, quotes and line breaks", () => {
  const csv = toCsv([row({ description: 'Say "hi", ok\nbye', paid: false })]);
  assert.equal(csv, `${HEAD}2026-09-24,"Say ""hi"", ok\nbye",Groceries,expense,92.50,false\r\n`);
});

test("toCsv neutralizes cells that spreadsheets would run as formulas", () => {
  const csv = toCsv([row({ description: "=SUM(A1)" }), row({ description: "-5 refund" }), row({ description: "@x" })]);
  assert.deepEqual(
    csv.split("\r\n").slice(1, 4).map((line) => line.split(",")[1]),
    ["'=SUM(A1)", "'-5 refund", "'@x"]
  );
});

test("toCsv leaves an empty description empty", () => {
  assert.equal(toCsv([row({ description: null })]), `${HEAD}2026-09-24,,Groceries,expense,92.50,true\r\n`);
});
