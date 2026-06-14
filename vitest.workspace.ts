import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "packages/core/vitest.config.ts",
  "packages/primitives/dialog/vitest.config.ts",
  "packages/react/vitest.config.ts",
  "packages/vue/vitest.config.ts",
  "packages/nuxt/vitest.config.ts",
]);
