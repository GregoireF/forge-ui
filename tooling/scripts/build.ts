#!/usr/bin/env bun
import { execSync } from "node:child_process";
import { existsSync, readdirSync, rmSync } from "node:fs";
import { build } from "bun";

const cwd = process.cwd();
const pkg = await import(`${cwd}/package.json`);

const external = [
  ...Object.keys(pkg.peerDependencies ?? {}),
  ...Object.keys(pkg.dependencies ?? {}),
];

// Clean dist
rmSync(`${cwd}/dist`, { recursive: true, force: true });

// Discover sub-entries: src/*/index.ts
const srcDir = `${cwd}/src`;
const subEntries: string[] = [];
if (existsSync(srcDir)) {
  for (const dir of readdirSync(srcDir, { withFileTypes: true })) {
    if (dir.isDirectory()) {
      const entry = `${srcDir}/${dir.name}/index.ts`;
      if (existsSync(entry)) subEntries.push(entry);
    }
  }
}

// ESM with splitting (enables shared chunks between subpaths)
await build({
  entrypoints: [`${cwd}/src/index.ts`, ...subEntries],
  outdir: `${cwd}/dist`,
  format: "esm",
  target: "browser",
  external,
  splitting: true,
  minify: true,
  sourcemap: "external",
});

// CJS — main entry only (splitting not needed for CJS consumers)
await build({
  entrypoints: [`${cwd}/src/index.ts`],
  outdir: `${cwd}/dist`,
  format: "cjs",
  naming: { entry: "[dir]/[name].cjs" },
  target: "node",
  external,
  minify: true,
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
