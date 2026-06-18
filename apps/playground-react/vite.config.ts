import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@forge-ui/react": fileURLToPath(new URL("../../packages/react/src/index.ts", import.meta.url)),
      "@forge-ui/core": fileURLToPath(new URL("../../packages/core/src/index.ts", import.meta.url)),
      "@forge-ui/alert-dialog": fileURLToPath(new URL("../../packages/primitives/alert-dialog/src/index.ts", import.meta.url)),
      "@forge-ui/checkbox": fileURLToPath(new URL("../../packages/primitives/checkbox/src/index.ts", import.meta.url)),
      "@forge-ui/switch": fileURLToPath(new URL("../../packages/primitives/switch/src/index.ts", import.meta.url)),
      "@forge-ui/dialog": fileURLToPath(new URL("../../packages/primitives/dialog/src/index.ts", import.meta.url)),
      "@forge-ui/popover": fileURLToPath(new URL("../../packages/primitives/popover/src/index.ts", import.meta.url)),
      "@forge-ui/select": fileURLToPath(new URL("../../packages/primitives/select/src/index.ts", import.meta.url)),
      "@forge-ui/field": fileURLToPath(new URL("../../packages/primitives/field/src/index.ts", import.meta.url)),
      "@forge-ui/combobox": fileURLToPath(new URL("../../packages/primitives/combobox/src/index.ts", import.meta.url)),
      "@forge-ui/tooltip": fileURLToPath(new URL("../../packages/primitives/tooltip/src/index.ts", import.meta.url)),
      "@forge-ui/floating": fileURLToPath(new URL("../../packages/floating/src/index.ts", import.meta.url)),
    },
  },
  server: {
    port: 3000,
  },
});
