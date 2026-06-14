import { addComponent, addImports, defineNuxtModule } from "@nuxt/kit";

/**
 * @forge-ui/nuxt — Nuxt 3/4 module.
 *
 * Adds auto-imports for all forge-ui Dialog APIs so the consumer
 * never needs an explicit import in their <script setup>.
 *
 * Usage — nuxt.config.ts:
 *   modules: ['@forge-ui/nuxt']
 *
 * Then in any .vue file (no import needed):
 *   const dialog = useDialog()
 *   <Dialog.Root> / <DialogRoot> / etc.
 */
export default defineNuxtModule({
  meta: {
    name: "@forge-ui/nuxt",
    configKey: "forgeUi",
    compatibility: { nuxt: ">=4.0.0" },
  },

  setup() {
    const from = "@forge-ui/vue";

    // ---------------------------------------------------------------------------
    // Composables
    // ---------------------------------------------------------------------------
    addImports([
      { name: "useDialog", from },
      { name: "useMachine", from },
    ]);

    // The `Dialog` namespace object — enables <Dialog.Root> in templates
    addImports({ name: "Dialog", from });

    // ---------------------------------------------------------------------------
    // Individual named components (PascalCase, no prefix collision)
    // ---------------------------------------------------------------------------
    const components = [
      "DialogRoot",
      "DialogTrigger",
      "DialogOverlay",
      "DialogContent",
      "DialogTitle",
      "DialogDescription",
      "DialogClose",
      "DialogPortal",
    ] as const;

    for (const name of components) {
      addComponent({ name, export: name, filePath: from });
    }
  },
});
