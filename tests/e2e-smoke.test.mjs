import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const routes = [
  "src/routes/index.tsx",
  "src/routes/contact.tsx",
  "src/routes/offerte.tsx",
  "src/routes/producten.index.tsx",
  "src/routes/portfolio.index.tsx",
  "src/routes/cases.index.tsx",
];

test("smoke routes exist for the main customer journeys", () => {
  for (const route of routes) {
    assert.equal(existsSync(new URL(`../${route}`, import.meta.url)), true, route);
  }
});

test("homepage points visitors to the Geheel Digitaal migration target", () => {
  const home = readFileSync(new URL("../src/routes/index.tsx", import.meta.url), "utf8");
  assert.match(home, /Van Appiah is nu Geheel Digitaal/);
  assert.match(home, /href=\{NEW_SITE_URL\}/);
});
