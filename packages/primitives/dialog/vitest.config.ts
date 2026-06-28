import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@forge-ui/core": fileURLToPath(new URL("../../core/src/index.ts", import.meta.url)),
    },
  },
  test: {
    name: "dialog",
    globals: true,
    environment: "happy-dom",
    include: ["tests/**/*.test.ts"],
    setupFiles: ["tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "lcov"],
      include: ["src/**/*.ts"],
      exclude: ["src/index.ts"],
      thresholds: { lines: 85, functions: 88, branches: 78, statements: 85 },
    },
  },
});
