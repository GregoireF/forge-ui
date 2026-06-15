import { fileURLToPath } from "node:url";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@forge-ui/vue": fileURLToPath(new URL("../../packages/vue/src/index.ts", import.meta.url)),
      "@forge-ui/core": fileURLToPath(new URL("../../packages/core/src/index.ts", import.meta.url)),
      "@forge-ui/dialog": fileURLToPath(new URL("../../packages/primitives/dialog/src/index.ts", import.meta.url)),
      "@forge-ui/popover": fileURLToPath(new URL("../../packages/primitives/popover/src/index.ts", import.meta.url)),
      "@forge-ui/field": fileURLToPath(new URL("../../packages/field/src/index.ts", import.meta.url)),
      "@forge-ui/floating": fileURLToPath(new URL("../../packages/floating/src/index.ts", import.meta.url)),
    },
  },
  server: {
    port: 3001,
  },
});
