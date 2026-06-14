#!/usr/bin/env bun
/**
 * Build script for @forge-ui/nuxt.
 * Same pipeline as build.ts but:
 *   - Entry point is src/module.ts (not src/index.ts)
 *   - @nuxt/kit + @nuxt/schema are external (provided by the consumer's Nuxt install)
 */
import { execSync } from "node:child_process";
import { rmSync } from "node:fs";
import { build } from "bun";

const cwd = process.cwd();
const pkg = await import(`${cwd}/package.json`);

const external = [
  "@nuxt/kit",
  "@nuxt/schema",
  "nuxt",
  ...Object.keys(pkg.peerDependencies ?? {}),
  ...Object.keys(pkg.dependencies ?? {}),
];

rmSync(`${cwd}/dist`, { recursive: true, force: true });

// ESM
await build({
  entrypoints: [`${cwd}/src/module.ts`],
  outdir: `${cwd}/dist`,
  format: "esm",
  target: "node",
  external,
  naming: { entry: "[dir]/[name].js" },
  minify: false,
});

// CJS
await build({
  entrypoints: [`${cwd}/src/module.ts`],
  outdir: `${cwd}/dist`,
  format: "cjs",
  target: "node",
  external,
  naming: { entry: "[dir]/[name].cjs" },
  minify: false,
});

execSync("bunx tsc -b --force", { stdio: "inherit", cwd });

console.log(`✓ Build complete: ${pkg.name}`);
