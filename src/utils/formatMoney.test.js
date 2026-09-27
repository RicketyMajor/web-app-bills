import { test } from "node:test";
import assert from "node:assert/strict";
import { formatMoney } from "./formatMoney.js";

// Intl uses non-breaking spaces; normalize for readable expectations
const fmt = (...args) => formatMoney(...args).replace(/\s/g, " ");

test("USD by default, en-US, always signed", () => {
  assert.equal(fmt(1234.5), "+$1,234.50");
  assert.equal(fmt(-1234.5), "-$1,234.50");
  assert.equal(fmt(0), "$0.00");
});

test("locale follows the currency", () => {
  assert.equal(fmt(-12345.5, "CLP"), "$-12.346"); // es-CL: no decimals, dot groups
  assert.equal(fmt(-12345.5, "EUR"), "-12.345,50 €");
  assert.equal(fmt(-12345.5, "GBP"), "-£12,345.50");
});

test("unknown currency falls back to en-US", () => {
  assert.equal(fmt(1, "JPY"), "+¥1");
});
