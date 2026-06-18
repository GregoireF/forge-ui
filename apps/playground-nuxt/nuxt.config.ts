import { fileURLToPath } from "node:url";

export default defineNuxtConfig({
  modules: ["@forge-ui/nuxt"],
  compatibilityDate: "2025-01-01",
  vite: {
    resolve: {
      alias: {
        "@forge-ui/vue": fileURLToPath(new URL("../../packages/vue/src/index.ts", import.meta.url)),
        "@forge-ui/core": fileURLToPath(new URL("../../packages/core/src/index.ts", import.meta.url)),
        "@forge-ui/alert-dialog": fileURLToPath(new URL("../../packages/primitives/alert-dialog/src/index.ts", import.meta.url)),
        "@forge-ui/checkbox": fileURLToPath(new URL("../../packages/primitives/checkbox/src/index.ts", import.meta.url)),
        "@forge-ui/switch": fileURLToPath(new URL("../../packages/primitives/switch/src/index.ts", import.meta.url)),
        "@forge-ui/dialog": fileURLToPath(new URL("../../packages/primitives/dialog/src/index.ts", import.meta.url)),
        "@forge-ui/popover": fileURLToPath(new URL("../../packages/primitives/popover/src/index.ts", import.meta.url)),
        "@forge-ui/select": fileURLToPath(new URL("../../packages/primitives/select/src/index.ts", import.meta.url)),
        "@forge-ui/field": fileURLToPath(new URL("../../packages/field/src/index.ts", import.meta.url)),
        "@forge-ui/tooltip": fileURLToPath(new URL("../../packages/primitives/tooltip/src/index.ts", import.meta.url)),
        "@forge-ui/floating": fileURLToPath(new URL("../../packages/floating/src/index.ts", import.meta.url)),
      },
    },
  },
});
