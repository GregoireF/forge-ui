/**
 * Updates axe-badge.json based on the last playwright run results.
 *
 * Usage (run from repo root after `cd e2e && bun run test`):
 *   node e2e/update-axe-badge.mjs
 *
 * In CI, add a step after the e2e job:
 *   - run: node e2e/update-axe-badge.mjs
 *   - uses: stefanzweifel/git-auto-commit-action@v5
 *     with:
 *       commit_message: "chore: update axe badge [skip ci]"
 *       file_pattern: axe-badge.json
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");

// Parse playwright JSON results
const resultsPath = resolve(__dirname, "test-results/results.json");
let results;
try {
  results = JSON.parse(readFileSync(resultsPath, "utf-8"));
} catch {
  console.error("No test results found. Run `bun run test` from e2e/ first.");
  process.exit(1);
}

// Walk all specs and filter those matching a11y/axe patterns
function collectSpecs(suites) {
  const specs = [];
  for (const suite of suites ?? []) {
    specs.push(...(suite.specs ?? []));
    specs.push(...collectSpecs(suite.suites));
  }
  return specs;
}

const allSpecs = collectSpecs(results.suites);
const a11ySpecs = allSpecs.filter(
  (s) =>
    s.file?.includes("a11y") ||
    s.title?.toLowerCase().includes("axe") ||
    s.title?.toLowerCase().includes("a11y") ||
    s.title?.toLowerCase().includes("violation"),
);

const a11yFailures = a11ySpecs.filter((s) =>
  s.tests?.some((t) => t.results?.some((r) => r.status === "failed")),
);

const violationCount = a11yFailures.length;
const color = violationCount === 0 ? "brightgreen" : "critical";
const message =
  violationCount === 0
    ? "0 violations"
    : `${violationCount} violation${violationCount > 1 ? "s" : ""}`;

const badge = {
  schemaVersion: 1,
  label: "axe-core WCAG 2.1 AA",
  message,
  color,
  namedLogo: "accessibility",
};

const badgePath = resolve(repoRoot, "axe-badge.json");
writeFileSync(badgePath, `${JSON.stringify(badge, null, 2)}\n`);

console.log(`Badge updated: ${message} (${color})`);
if (violationCount > 0) {
  console.log("Failing a11y specs:");
  for (const s of a11yFailures) console.log(` - ${s.file}: ${s.title}`);
}
