import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@forge-ui/dialog": fileURLToPath(new URL("../dialog/src/index.ts", import.meta.url)),
      "@forge-ui/core": fileURLToPath(new URL("../../core/src/index.ts", import.meta.url)),
    },
  },
  test: {
    name: "alert-dialog",
    globals: true,
    environment: "happy-dom",
    include: ["tests/**/*.test.ts"],
  },
});
