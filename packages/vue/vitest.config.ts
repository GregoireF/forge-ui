import { fileURLToPath } from "node:url";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@forge-ui/core": fileURLToPath(new URL("../core/src/index.ts", import.meta.url)),
      "@forge-ui/dialog": fileURLToPath(
        new URL("../primitives/dialog/src/index.ts", import.meta.url),
      ),
      "@forge-ui/field": fileURLToPath(new URL("../field/src/index.ts", import.meta.url)),
    },
  },
  test: {
    name: "vue",
    globals: true,
    environment: "happy-dom",
    include: ["tests/**/*.test.ts"],
    setupFiles: ["tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts"],
    },
  },
});
