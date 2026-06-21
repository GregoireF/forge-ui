import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "tags-input",
    globals: true,
    environment: "happy-dom",
    include: ["tests/**/*.test.ts"],
  },
});
