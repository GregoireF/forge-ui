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
    name: "select",
    globals: true,
    environment: "happy-dom",
    include: ["tests/**/*.test.ts"],
  },
});
