import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@forge-ui/core": fileURLToPath(new URL("../core/src/index.ts", import.meta.url)),
      "@forge-ui/accordion": fileURLToPath(
        new URL("../primitives/accordion/src/index.ts", import.meta.url),
      ),
      "@forge-ui/collapsible": fileURLToPath(
        new URL("../primitives/collapsible/src/index.ts", import.meta.url),
      ),
      "@forge-ui/progress": fileURLToPath(
        new URL("../primitives/progress/src/index.ts", import.meta.url),
      ),
      "@forge-ui/radio-group": fileURLToPath(
        new URL("../primitives/radio-group/src/index.ts", import.meta.url),
      ),
      "@forge-ui/tabs": fileURLToPath(new URL("../primitives/tabs/src/index.ts", import.meta.url)),
      "@forge-ui/alert-dialog": fileURLToPath(
        new URL("../primitives/alert-dialog/src/index.ts", import.meta.url),
      ),
      "@forge-ui/dialog": fileURLToPath(
        new URL("../primitives/dialog/src/index.ts", import.meta.url),
      ),
      "@forge-ui/field": fileURLToPath(
        new URL("../primitives/field/src/index.ts", import.meta.url),
      ),
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
      "@forge-ui/slider": fileURLToPath(
        new URL("../primitives/slider/src/index.ts", import.meta.url),
      ),
      "@forge-ui/tooltip": fileURLToPath(
        new URL("../primitives/tooltip/src/index.ts", import.meta.url),
      ),
      "@forge-ui/hover-card": fileURLToPath(
        new URL("../primitives/hover-card/src/index.ts", import.meta.url),
      ),
      "@forge-ui/number-input": fileURLToPath(
        new URL("../primitives/number-input/src/index.ts", import.meta.url),
      ),
      "@forge-ui/date-field": fileURLToPath(
        new URL("../primitives/date-field/src/index.ts", import.meta.url),
      ),
      "@forge-ui/time-picker": fileURLToPath(
        new URL("../primitives/time-picker/src/index.ts", import.meta.url),
      ),
      "@forge-ui/date-picker": fileURLToPath(
        new URL("../primitives/date-picker/src/index.ts", import.meta.url),
      ),
      "@forge-ui/date-range-picker": fileURLToPath(
        new URL("../primitives/date-range-picker/src/index.ts", import.meta.url),
      ),
      "@forge-ui/toggle": fileURLToPath(
        new URL("../primitives/toggle/src/index.ts", import.meta.url),
      ),
      "@forge-ui/toggle-group": fileURLToPath(
        new URL("../primitives/toggle-group/src/index.ts", import.meta.url),
      ),
      "@forge-ui/separator": fileURLToPath(
        new URL("../primitives/separator/src/index.ts", import.meta.url),
      ),
      "@forge-ui/visually-hidden": fileURLToPath(
        new URL("../primitives/visually-hidden/src/index.ts", import.meta.url),
      ),
    },
  },
  test: {
    name: "react",
    globals: true,
    environment: "happy-dom",
    include: ["tests/**/*.test.tsx"],
    setupFiles: ["tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "json-summary", "lcov", "html"],
      include: ["src/**/*.ts", "src/**/*.tsx"],
      // Barrel re-export files contain zero logic — exclude to avoid skewing averages.
      exclude: ["src/**/index.ts", "src/**/index.tsx"],
      // Target thresholds (TODO: uncomment progressively as coverage improves):
      // thresholds: {
      //   lines: 90,
      //   functions: 92,
      //   branches: 80,
      //   statements: 88,
      // },
    },
  },
});
