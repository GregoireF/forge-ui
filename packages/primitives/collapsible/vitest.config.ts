import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "collapsible",
    globals: true,
    environment: "happy-dom",
    include: ["tests/**/*.test.ts"],
  },
});
