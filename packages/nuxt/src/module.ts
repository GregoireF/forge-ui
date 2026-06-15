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
      { name: "usePopover", from },
      { name: "useField", from },
      { name: "useMachine", from },
      { name: "usePresence", from },
    ]);

    // Namespace objects — enable <Dialog.Root> / <Popover.Root> / <Field.Root> in templates
    addImports({ name: "Dialog", from });
    addImports({ name: "Popover", from });
    addImports({ name: "Field", from });

    // ---------------------------------------------------------------------------
    // Individual named components (PascalCase, no prefix collision)
    // ---------------------------------------------------------------------------
    const dialogComponents = [
      "DialogRoot",
      "DialogTrigger",
      "DialogOverlay",
      "DialogContent",
      "DialogTitle",
      "DialogDescription",
      "DialogClose",
      "DialogPortal",
    ] as const;

    for (const name of dialogComponents) {
      addComponent({ name, export: name, filePath: from });
    }

    const popoverComponents = [
      "PopoverRoot",
      "PopoverTrigger",
      "PopoverAnchor",
      "PopoverPortal",
      "PopoverContent",
      "PopoverArrow",
      "PopoverClose",
      "PopoverTitle",
      "PopoverDescription",
    ] as const;

    for (const name of popoverComponents) {
      addComponent({ name, export: name, filePath: from });
    }

    const fieldComponents = [
      "FieldRoot",
      "FieldLabel",
      "FieldControl",
      "FieldDescription",
      "FieldError",
    ] as const;

    for (const name of fieldComponents) {
      addComponent({ name, export: name, filePath: from });
    }
  },
});
