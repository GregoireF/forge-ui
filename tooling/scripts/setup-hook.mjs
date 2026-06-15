#!/usr/bin/env node
// scripts/setup-hooks.mjs
// Installe les git hooks via lefthook.
// Sur Windows avec MSYS, lefthook peut échouer sur fork(). On catch et on guide.

import { execSync } from "node:child_process";
import { platform } from "node:os";

const isWindows = platform() === "win32";

function run(cmd) {
  execSync(cmd, { stdio: "inherit" });
}

try {
  run("bunx lefthook install");
  console.log("✅  Git hooks installed (lefthook).");
} catch (err) {
  if (isWindows) {
    console.warn(`
⚠️  lefthook install failed on Windows (fork() issue with MSYS).
   Git hooks are NOT active. Before each commit, run manually:

     bun run lint
     bun run typecheck

   And respect the commit format: <emoji> <type>(<scope>): <description>
   See CONTRIBUTING.md for details.
`);
    // Exit 0 : on ne bloque pas bun install sur Windows
    process.exit(0);
  }
  // Sur Linux/macOS, c'est une vraie erreur
  console.error("❌  lefthook install failed:", err.message);
  process.exit(1);
}
