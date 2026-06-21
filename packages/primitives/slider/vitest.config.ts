import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "slider",
    globals: true,
    environment: "happy-dom",
    include: ["tests/**/*.test.ts"],
  },
});
