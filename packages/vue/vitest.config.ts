import { fileURLToPath } from "node:url";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@forge-ui/core": fileURLToPath(new URL("../core/src/index.ts", import.meta.url)),
      "@forge-ui/accordion": fileURLToPath(
        new URL("../primitives/accordion/src/index.ts", import.meta.url),
      ),
      "@forge-ui/progress": fileURLToPath(
        new URL("../primitives/progress/src/index.ts", import.meta.url),
      ),
      "@forge-ui/radio-group": fileURLToPath(
        new URL("../primitives/radio-group/src/index.ts", import.meta.url),
      ),
      "@forge-ui/tabs": fileURLToPath(
        new URL("../primitives/tabs/src/index.ts", import.meta.url),
      ),
      "@forge-ui/alert-dialog": fileURLToPath(
        new URL("../primitives/alert-dialog/src/index.ts", import.meta.url),
      ),
      "@forge-ui/dialog": fileURLToPath(
        new URL("../primitives/dialog/src/index.ts", import.meta.url),
      ),
      "@forge-ui/field": fileURLToPath(new URL("../primitives/field/src/index.ts", import.meta.url)),
      "@forge-ui/floating": fileURLToPath(new URL("../floating/src/index.ts", import.meta.url)),
      "@forge-ui/popover": fileURLToPath(
        new URL("../primitives/popover/src/index.ts", import.meta.url),
      ),
      "@forge-ui/select": fileURLToPath(
        new URL("../primitives/select/src/index.ts", import.meta.url),
      ),
      "@forge-ui/checkbox": fileURLToPath(
        new URL("../primitives/checkbox/src/index.ts", import.meta.url),
      ),
      "@forge-ui/combobox": fileURLToPath(
        new URL("../primitives/combobox/src/index.ts", import.meta.url),
      ),
      "@forge-ui/switch": fileURLToPath(
        new URL("../primitives/switch/src/index.ts", import.meta.url),
      ),
      "@forge-ui/tags-input": fileURLToPath(
        new URL("../primitives/tags-input/src/index.ts", import.meta.url),
      ),
      "@forge-ui/tooltip": fileURLToPath(
        new URL("../primitives/tooltip/src/index.ts", import.meta.url),
      ),
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
