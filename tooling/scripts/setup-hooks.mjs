#!/usr/bin/env node
import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

if (process.platform === "win32") {
  // MSYS fork() fails at bash startup on many Windows configurations —
  // it's a git-for-windows/MSYS bug, not fixable from script content.
  // Redirect core.hooksPath to an empty directory so all hooks are silently
  // skipped locally. CI (GitHub Actions / Linux) runs lefthook and enforces
  // Biome + commitlint on every push.
  const noHooksDir = join(process.cwd(), ".git", "no-hooks");
  mkdirSync(noHooksDir, { recursive: true });
  execSync("git config --local core.hooksPath .git/no-hooks", { stdio: "inherit" });
  console.log(
    "[forge-ui] Windows detected: local git hooks disabled (MSYS fork() incompatibility).",
  );
  console.log("[forge-ui] CI enforces lint + typecheck + tests on every push.");
} else {
  execSync("lefthook install", { stdio: "inherit" });
}
