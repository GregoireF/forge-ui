import { fileURLToPath } from "node:url";

export default defineNuxtConfig({
  modules: [fileURLToPath(new URL("../../packages/nuxt/src/module.ts", import.meta.url))],
  compatibilityDate: "2025-01-01",
  devServer: { port: 3002 },
  vite: {
    resolve: {
      alias: {
        "@forge-ui/vue": fileURLToPath(new URL("../../packages/vue/src/index.ts", import.meta.url)),
        "@forge-ui/core": fileURLToPath(
          new URL("../../packages/core/src/index.ts", import.meta.url),
        ),
        "@forge-ui/floating": fileURLToPath(
          new URL("../../packages/floating/src/index.ts", import.meta.url),
        ),
        "@forge-ui/avatar": fileURLToPath(
          new URL("../../packages/primitives/avatar/src/index.ts", import.meta.url),
        ),
        "@forge-ui/accordion": fileURLToPath(
          new URL("../../packages/primitives/accordion/src/index.ts", import.meta.url),
        ),
        "@forge-ui/alert-dialog": fileURLToPath(
          new URL("../../packages/primitives/alert-dialog/src/index.ts", import.meta.url),
        ),
        "@forge-ui/checkbox": fileURLToPath(
          new URL("../../packages/primitives/checkbox/src/index.ts", import.meta.url),
        ),
        "@forge-ui/collapsible": fileURLToPath(
          new URL("../../packages/primitives/collapsible/src/index.ts", import.meta.url),
        ),
        "@forge-ui/combobox": fileURLToPath(
          new URL("../../packages/primitives/combobox/src/index.ts", import.meta.url),
        ),
        "@forge-ui/date-field": fileURLToPath(
          new URL("../../packages/primitives/date-field/src/index.ts", import.meta.url),
        ),
        "@forge-ui/date-picker": fileURLToPath(
          new URL("../../packages/primitives/date-picker/src/index.ts", import.meta.url),
        ),
        "@forge-ui/date-range-picker": fileURLToPath(
          new URL("../../packages/primitives/date-range-picker/src/index.ts", import.meta.url),
        ),
        "@forge-ui/dialog": fileURLToPath(
          new URL("../../packages/primitives/dialog/src/index.ts", import.meta.url),
        ),
        "@forge-ui/field": fileURLToPath(
          new URL("../../packages/primitives/field/src/index.ts", import.meta.url),
        ),
        "@forge-ui/hover-card": fileURLToPath(
          new URL("../../packages/primitives/hover-card/src/index.ts", import.meta.url),
        ),
        "@forge-ui/menu": fileURLToPath(
          new URL("../../packages/primitives/menu/src/index.ts", import.meta.url),
        ),
        "@forge-ui/number-input": fileURLToPath(
          new URL("../../packages/primitives/number-input/src/index.ts", import.meta.url),
        ),
        "@forge-ui/popover": fileURLToPath(
          new URL("../../packages/primitives/popover/src/index.ts", import.meta.url),
        ),
        "@forge-ui/progress": fileURLToPath(
          new URL("../../packages/primitives/progress/src/index.ts", import.meta.url),
        ),
        "@forge-ui/radio-group": fileURLToPath(
          new URL("../../packages/primitives/radio-group/src/index.ts", import.meta.url),
        ),
        "@forge-ui/select": fileURLToPath(
          new URL("../../packages/primitives/select/src/index.ts", import.meta.url),
        ),
        "@forge-ui/separator": fileURLToPath(
          new URL("../../packages/primitives/separator/src/index.ts", import.meta.url),
        ),
        "@forge-ui/slider": fileURLToPath(
          new URL("../../packages/primitives/slider/src/index.ts", import.meta.url),
        ),
        "@forge-ui/switch": fileURLToPath(
          new URL("../../packages/primitives/switch/src/index.ts", import.meta.url),
        ),
        "@forge-ui/tabs": fileURLToPath(
          new URL("../../packages/primitives/tabs/src/index.ts", import.meta.url),
        ),
        "@forge-ui/tags-input": fileURLToPath(
          new URL("../../packages/primitives/tags-input/src/index.ts", import.meta.url),
        ),
        "@forge-ui/time-picker": fileURLToPath(
          new URL("../../packages/primitives/time-picker/src/index.ts", import.meta.url),
        ),
        "@forge-ui/toggle": fileURLToPath(
          new URL("../../packages/primitives/toggle/src/index.ts", import.meta.url),
        ),
        "@forge-ui/toggle-group": fileURLToPath(
          new URL("../../packages/primitives/toggle-group/src/index.ts", import.meta.url),
        ),
        "@forge-ui/tooltip": fileURLToPath(
          new URL("../../packages/primitives/tooltip/src/index.ts", import.meta.url),
        ),
        "@forge-ui/visually-hidden": fileURLToPath(
          new URL("../../packages/primitives/visually-hidden/src/index.ts", import.meta.url),
        ),
      },
    },
  },
});
