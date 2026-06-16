import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@forge-ui/core": fileURLToPath(new URL("../core/src/index.ts", import.meta.url)),
      "@forge-ui/alert-dialog": fileURLToPath(
        new URL("../primitives/alert-dialog/src/index.ts", import.meta.url),
      ),
      "@forge-ui/dialog": fileURLToPath(
        new URL("../primitives/dialog/src/index.ts", import.meta.url),
      ),
      "@forge-ui/field": fileURLToPath(new URL("../field/src/index.ts", import.meta.url)),
      "@forge-ui/floating": fileURLToPath(new URL("../floating/src/index.ts", import.meta.url)),
      "@forge-ui/popover": fileURLToPath(
        new URL("../primitives/popover/src/index.ts", import.meta.url),
      ),
    },
  },
  test: {
    name: "react",
    globals: true,
    environment: "happy-dom",
    include: ["tests/**/*.test.tsx", "tests/**/*.test.ts"],
    setupFiles: ["tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts", "src/**/*.tsx"],
    },
  },
});
