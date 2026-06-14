import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "nuxt",
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
