#!/usr/bin/env bun
import { execSync } from "node:child_process";
import { rmSync } from "node:fs";
import { build } from "bun";

const cwd = process.cwd();
const pkg = await import(`${cwd}/package.json`);

const external = [
  ...Object.keys(pkg.peerDependencies ?? {}),
  ...Object.keys(pkg.dependencies ?? {}),
];

// Clean dist
rmSync(`${cwd}/dist`, { recursive: true, force: true });

// ESM
await build({
  entrypoints: [`${cwd}/src/index.ts`],
  outdir: `${cwd}/dist`,
  format: "esm",
  target: "browser",
  external,
  minify: false,
  sourcemap: "external",
});

// CJS
await build({
  entrypoints: [`${cwd}/src/index.ts`],
  outdir: `${cwd}/dist`,
  format: "cjs",
  naming: { entry: "[dir]/[name].cjs" },
  target: "node",
  external,
  minify: false,
  sourcemap: "external",
});

// Types via tsc -b --force: composite build mode creates .tsbuildinfo for
// incremental CI builds. --force is needed because rmSync above deletes dist/
// but leaves tsconfig.tsbuildinfo, making tsc think the project is up-to-date.
execSync("bunx tsc -b --force", {
  stdio: "inherit",
  cwd,
});

console.log(`✓ Build complete: ${pkg.name}`);
