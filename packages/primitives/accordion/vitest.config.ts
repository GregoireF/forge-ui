import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "accordion",
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
