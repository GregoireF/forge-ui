import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "switch",
    globals: true,
    environment: "happy-dom",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "lcov"],
      include: ["src/**/*.ts"],
      exclude: ["src/index.ts"],
      // Target thresholds (TODO: uncomment progressively as coverage improves):
      // thresholds: { lines: 85, functions: 88, branches: 78, statements: 85 },
    },
  },
});
