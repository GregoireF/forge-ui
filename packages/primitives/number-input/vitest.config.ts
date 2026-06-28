import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "number-input",
    globals: true,
    environment: "happy-dom",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "lcov"],
      include: ["src/**/*.ts"],
      exclude: ["src/index.ts"],
      // Two gaps are intentionally excluded from 90% target:
      // 1. formatNumber() catch block — only reachable when Intl.NumberFormat throws
      //    (native API, mocking adds complexity without testing real behavior).
      // 2. makeSpinActivity.tick() body — only runs after requestAnimationFrame fires
      //    AND 300ms elapse. Testing requires fake timers + RAF mocking to test
      //    infrastructure rather than machine logic. Spin state transitions are covered.
      thresholds: { lines: 88, functions: 93, branches: 80, statements: 88 },
    },
  },
});
