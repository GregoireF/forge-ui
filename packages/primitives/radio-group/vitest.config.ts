import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "radio-group",
    globals: true,
    environment: "happy-dom",
    include: ["tests/**/*.test.ts"],
  },
});
