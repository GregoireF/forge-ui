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
      { name: "useAlertDialog", from },
      { name: "usePopover", from },
      { name: "useSelect", from },
      { name: "useField", from },
      { name: "useCheckbox", from },
      { name: "useSwitch", from },
      { name: "useTooltip", from },
      { name: "useCombobox", from },
      { name: "useMachine", from },
      { name: "usePresence", from },
    ]);

    // Namespace objects — enable <Dialog.Root> / <Popover.Root> / etc. in templates
    addImports({ name: "Dialog", from });
    addImports({ name: "AlertDialog", from });
    addImports({ name: "Popover", from });
    addImports({ name: "Select", from });
    addImports({ name: "Field", from });
    addImports({ name: "Checkbox", from });
    addImports({ name: "Switch", from });
    addImports({ name: "Tooltip", from });
    addImports({ name: "Combobox", from });

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

    const alertDialogComponents = [
      "AlertDialogRoot",
      "AlertDialogTrigger",
      "AlertDialogOverlay",
      "AlertDialogContent",
      "AlertDialogTitle",
      "AlertDialogDescription",
      "AlertDialogCancel",
      "AlertDialogAction",
      "AlertDialogPortal",
    ] as const;

    for (const name of alertDialogComponents) {
      addComponent({ name, export: name, filePath: from });
    }

    const selectComponents = [
      "SelectRoot",
      "SelectLabel",
      "SelectTrigger",
      "SelectValue",
      "SelectPlaceholder",
      "SelectPortal",
      "SelectContent",
      "SelectItem",
      "SelectItemText",
      "SelectItemIndicator",
      "SelectSeparator",
      "SelectGroup",
      "SelectGroupLabel",
    ] as const;

    for (const name of selectComponents) {
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
      "FieldRequiredIndicator",
      "FieldControl",
      "FieldDescription",
      "FieldError",
      "FieldGroup",
      "FieldGroupLabel",
    ] as const;

    for (const name of fieldComponents) {
      addComponent({ name, export: name, filePath: from });
    }

    const checkboxComponents = [
      "CheckboxRoot",
      "CheckboxControl",
      "CheckboxIndicator",
      "CheckboxLabel",
      "CheckboxGroup",
      "CheckboxGroupAll",
    ] as const;

    for (const name of checkboxComponents) {
      addComponent({ name, export: name, filePath: from });
    }

    const switchComponents = [
      "SwitchRoot",
      "SwitchControl",
      "SwitchThumb",
      "SwitchLabel",
    ] as const;

    for (const name of switchComponents) {
      addComponent({ name, export: name, filePath: from });
    }

    const tooltipComponents = [
      "TooltipProvider",
      "TooltipRoot",
      "TooltipTrigger",
      "TooltipAnchor",
      "TooltipPortal",
      "TooltipContent",
      "TooltipArrow",
    ] as const;

    const comboboxComponents = [
      "ComboboxRoot",
      "ComboboxLabel",
      "ComboboxInput",
      "ComboboxTrigger",
      "ComboboxClearTrigger",
      "ComboboxPortal",
      "ComboboxContent",
      "ComboboxItem",
      "ComboboxItemText",
      "ComboboxItemIndicator",
    ] as const;

    for (const name of tooltipComponents) {
      addComponent({ name, export: name, filePath: from });
    }

    for (const name of comboboxComponents) {
      addComponent({ name, export: name, filePath: from });
    }
  },
});
