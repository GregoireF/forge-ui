import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@forge-ui/core": fileURLToPath(new URL("../../core/src/index.ts", import.meta.url)),
      "@forge-ui/floating": fileURLToPath(new URL("../../floating/src/index.ts", import.meta.url)),
    },
  },
  test: {
    name: "tooltip",
    globals: true,
    environment: "happy-dom",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "lcov"],
      include: ["src/**/*.ts"],
    },
  },
});
