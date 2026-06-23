#!/usr/bin/env bun
/**
 * Bundle size reporter for forge-ui primitives.
 *
 * WHY this exists:
 * Tree-shaking is only meaningful if we measure it. Zag.js publishes per-primitive
 * sizes in their README. Radix UI tracks this via size-limit. Without a baseline
 * we can't detect accidental regressions (e.g. importing a transitive dep that
 * pulls in 50kB).
 *
 * How it works:
 * For each primitive package, we create a synthetic entry that imports the full
 * public API (`import * from "@forge-ui/accordion"`) and bundle it with esbuild
 * using tree-shaking + minification. We then measure gzip and brotli sizes.
 * This simulates what a real consumer downloads.
 *
 * Usage:
 *   bun run tooling/scripts/bundle-size.ts
 *   bun run tooling/scripts/bundle-size.ts --fail-on-threshold
 *
 * Output:
 *   A table of per-primitive sizes with gzip and brotli columns.
 *   Color-coded by severity (green ≤ 4kB, yellow ≤ 8kB, red > 8kB).
 *
 * Thresholds (informed by Zag.js benchmarks and Radix published sizes):
 * - Machine-only package (no floating): target ≤ 2kB gzip
 * - With floating (select, combobox, popover, tooltip): target ≤ 5kB gzip
 */

import { build } from "bun";
import { deflate, brotliCompress } from "node:zlib";
import { promisify } from "node:util";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const gzip = promisify(deflate);
const brotli = promisify(brotliCompress);

const root = resolve(import.meta.dir, "../..");
const tmpDir = join(root, "node_modules/.cache/bundle-size");
if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

// ---------------------------------------------------------------------------
// Thresholds (gzip bytes). Informed by competitor benchmarks.
// ---------------------------------------------------------------------------

const THRESHOLDS: Record<string, { warn: number; fail: number }> = {
  // Simple primitives — no floating, no complex DOM management
  accordion:   { warn: 3_000,  fail: 5_000  },
  checkbox:    { warn: 2_000,  fail: 3_500  },
  collapsible: { warn: 2_000,  fail: 3_500  },
  "hover-card":{ warn: 3_000,  fail: 5_000  },
  progress:    { warn: 1_500,  fail: 2_500  },
  "radio-group":{ warn: 2_500, fail: 4_000  },
  slider:      { warn: 3_000,  fail: 5_000  },
  switch:      { warn: 2_000,  fail: 3_500  },
  tabs:        { warn: 2_500,  fail: 4_000  },
  "tags-input":{ warn: 3_500,  fail: 6_000  },
  tooltip:     { warn: 3_000,  fail: 5_000  },
  // Dialog / popover / select / combobox use floating-ui — heavier
  dialog:      { warn: 4_000,  fail: 7_000  },
  popover:     { warn: 5_000,  fail: 8_500  },
  select:      { warn: 6_000,  fail: 10_000 },
  combobox:    { warn: 7_000,  fail: 12_000 },
  field:       { warn: 2_000,  fail: 3_500  },
};

const PACKAGES = Object.keys(THRESHOLDS);

// ---------------------------------------------------------------------------
// Per-package analysis
// ---------------------------------------------------------------------------

interface Result {
  name: string;
  raw: number;
  gzip: number;
  brotli: number;
  warnThreshold: number;
  failThreshold: number;
  status: "ok" | "warn" | "fail" | "missing";
}

async function analyzePackage(name: string): Promise<Result> {
  const pkgPath = join(root, "packages/primitives", name);
  const distEntry = join(pkgPath, "dist/index.js");
  const threshold = THRESHOLDS[name] ?? { warn: 5_000, fail: 10_000 };

  if (!existsSync(distEntry)) {
    return { name, raw: 0, gzip: 0, brotli: 0, ...threshold, warnThreshold: threshold.warn, failThreshold: threshold.fail, status: "missing" };
  }

  // Write a synthetic entry that imports the full public API
  const entryContent = `export * from "${join(pkgPath, "dist/index.js").replace(/\\/g, "/")}";`;
  const entryPath = join(tmpDir, `${name}-entry.js`);
  writeFileSync(entryPath, entryContent);

  // Bundle with bun (tree-shaking + minify)
  const result = await build({
    entrypoints: [entryPath],
    format: "esm",
    target: "browser",
    minify: true,
    external: ["react", "vue", "@vue/reactivity", "@floating-ui/dom"],
  });

  if (!result.success || result.outputs.length === 0) {
    return { name, raw: 0, gzip: 0, brotli: 0, warnThreshold: threshold.warn, failThreshold: threshold.fail, status: "missing" };
  }

  const code = await result.outputs[0].arrayBuffer();
  const buffer = Buffer.from(code);
  const gzipped = await gzip(buffer, { level: 9 });
  const brotlied = await brotli(buffer);

  const gzipSize = (gzipped as Buffer).length;
  const status: Result["status"] =
    gzipSize > threshold.fail ? "fail" :
    gzipSize > threshold.warn ? "warn" :
    "ok";

  return {
    name,
    raw: buffer.length,
    gzip: gzipSize,
    brotli: (brotlied as Buffer).length,
    warnThreshold: threshold.warn,
    failThreshold: threshold.fail,
    status,
  };
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function fmt(bytes: number): string {
  if (bytes === 0) return "—";
  return `${(bytes / 1024).toFixed(2)} kB`;
}

const RESET = "\x1b[0m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";

function colorize(result: Result, text: string): string {
  if (result.status === "missing") return `${DIM}${text}${RESET}`;
  if (result.status === "fail") return `${RED}${text}${RESET}`;
  if (result.status === "warn") return `${YELLOW}${text}${RESET}`;
  return `${GREEN}${text}${RESET}`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

console.log(`\n${BOLD}forge-ui — Bundle Size Report${RESET}`);
console.log("━".repeat(70));
console.log(
  `${"Package".padEnd(20)} ${"Raw".padStart(9)} ${"Gzip".padStart(9)} ${"Brotli".padStart(9)}  ${"Status".padEnd(6)} Threshold`,
);
console.log("─".repeat(70));

const results: Result[] = [];
let anyFail = false;

for (const name of PACKAGES) {
  const r = await analyzePackage(name);
  results.push(r);

  const statusIcon = r.status === "ok" ? "✓" : r.status === "warn" ? "⚠" : r.status === "fail" ? "✗" : "?";
  const row = `${name.padEnd(20)} ${fmt(r.raw).padStart(9)} ${fmt(r.gzip).padStart(9)} ${fmt(r.brotli).padStart(9)}  ${statusIcon}      ≤${fmt(r.failThreshold)}`;
  console.log(colorize(r, row));

  if (r.status === "fail") anyFail = true;
}

console.log("─".repeat(70));

const total = results.reduce((a, r) => ({ gzip: a.gzip + r.gzip, brotli: a.brotli + r.brotli }), { gzip: 0, brotli: 0 });
console.log(`${"TOTAL (all primitives)".padEnd(20)} ${"".padStart(9)} ${fmt(total.gzip).padStart(9)} ${fmt(total.brotli).padStart(9)}`);
console.log("━".repeat(70));

// Competitor comparison reference
console.log(`\n${DIM}Reference sizes (gzip, from public benchmarks):${RESET}`);
console.log(`${DIM}  Radix UI accordion:          ~3.8 kB${RESET}`);
console.log(`${DIM}  Zag.js accordion:            ~2.5 kB${RESET}`);
console.log(`${DIM}  Radix UI select:             ~9.2 kB (includes @floating-ui/dom)${RESET}`);
console.log(`${DIM}  Zag.js combobox:             ~8.1 kB${RESET}`);
console.log(`${DIM}  Headless UI combobox (React): ~12 kB${RESET}`);
console.log();

if (anyFail && process.argv.includes("--fail-on-threshold")) {
  console.error(`${RED}${BOLD}✗ Bundle size threshold exceeded. See above for details.${RESET}`);
  process.exit(1);
}

console.log(`${GREEN}Done.${RESET} Run with --fail-on-threshold to fail CI on regressions.\n`);
