import { addComponent, addImports } from "@nuxt/kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import mod from "../src/module.js";

vi.mock("@nuxt/kit", () => ({
  defineNuxtModule: (def: unknown) => def,
  addComponent: vi.fn(),
  addImports: vi.fn(),
}));

type ModuleDef = {
  meta: { name: string; configKey: string; compatibility: { nuxt: string } };
  setup: () => void;
};

const module = mod as unknown as ModuleDef;
const FROM = "@forge-ui/vue";

// ---------------------------------------------------------------------------
// Component lists (mirror module.ts exactly — test contract, not implementation)
// ---------------------------------------------------------------------------

const DIALOG_COMPONENTS = [
  "DialogRoot", "DialogTrigger", "DialogOverlay", "DialogContent",
  "DialogTitle", "DialogDescription", "DialogClose", "DialogPortal",
] as const;

const ALERT_DIALOG_COMPONENTS = [
  "AlertDialogRoot", "AlertDialogTrigger", "AlertDialogOverlay", "AlertDialogContent",
  "AlertDialogTitle", "AlertDialogDescription", "AlertDialogCancel", "AlertDialogAction",
  "AlertDialogPortal",
] as const;

const SELECT_COMPONENTS = [
  "SelectRoot", "SelectLabel", "SelectTrigger", "SelectValue", "SelectPlaceholder",
  "SelectPortal", "SelectContent", "SelectItem", "SelectItemText", "SelectItemIndicator",
  "SelectSeparator", "SelectGroup", "SelectGroupLabel",
] as const;

const POPOVER_COMPONENTS = [
  "PopoverRoot", "PopoverTrigger", "PopoverAnchor", "PopoverPortal",
  "PopoverContent", "PopoverArrow", "PopoverClose", "PopoverTitle", "PopoverDescription",
] as const;

const FIELD_COMPONENTS = [
  "FieldRoot", "FieldLabel", "FieldRequiredIndicator", "FieldControl",
  "FieldDescription", "FieldError", "FieldGroup", "FieldGroupLabel",
] as const;

const CHECKBOX_COMPONENTS = [
  "CheckboxRoot", "CheckboxControl", "CheckboxIndicator", "CheckboxLabel",
  "CheckboxGroup", "CheckboxGroupAll",
] as const;

const SWITCH_COMPONENTS = [
  "SwitchRoot", "SwitchControl", "SwitchThumb", "SwitchLabel",
] as const;

const TOOLTIP_COMPONENTS = [
  "TooltipProvider", "TooltipRoot", "TooltipTrigger", "TooltipAnchor",
  "TooltipPortal", "TooltipContent", "TooltipArrow",
] as const;

const HOVER_CARD_COMPONENTS = [
  "HoverCardRoot", "HoverCardTrigger", "HoverCardPortal",
  "HoverCardContent", "HoverCardArrow",
] as const;

const COMBOBOX_COMPONENTS = [
  "ComboboxRoot", "ComboboxLabel", "ComboboxInput", "ComboboxTrigger",
  "ComboboxClearTrigger", "ComboboxPortal", "ComboboxContent", "ComboboxItem",
  "ComboboxItemText", "ComboboxItemIndicator", "ComboboxGroup", "ComboboxGroupLabel",
  "ComboboxCreateOption",
] as const;

const TAGS_INPUT_COMPONENTS = [
  "TagsInputRoot", "TagsInputLabel", "TagsInputInput", "TagsInputTag",
  "TagsInputTagDelete", "TagsInputHiddenInput",
] as const;

// ---------------------------------------------------------------------------

describe("@forge-ui/nuxt", () => {
  beforeEach(() => {
    vi.mocked(addComponent).mockClear();
    vi.mocked(addImports).mockClear();
  });

  // -------------------------------------------------------------------------
  // Meta
  // -------------------------------------------------------------------------

  describe("meta", () => {
    it("has correct name", () => {
      expect(module.meta.name).toBe("@forge-ui/nuxt");
    });

    it("has correct configKey", () => {
      expect(module.meta.configKey).toBe("forgeUi");
    });

    it("requires Nuxt >=4", () => {
      expect(module.meta.compatibility.nuxt).toBe(">=4.0.0");
    });
  });

  // -------------------------------------------------------------------------
  // Composable auto-imports — single batch call
  // -------------------------------------------------------------------------

  describe("setup — composables", () => {
    const ALL_COMPOSABLES = [
      "useDialog",
      "useAlertDialog",
      "usePopover",
      "useSelect",
      "useField",
      "useCheckbox",
      "useSwitch",
      "useTooltip",
      "useHoverCard",
      "useCombobox",
      "useMachine",
      "usePresence",
      "useTagsInput",
    ] as const;

    it.each(ALL_COMPOSABLES)("registers %s in the composables batch", (name) => {
      module.setup();
      expect(vi.mocked(addImports)).toHaveBeenCalledWith(
        expect.arrayContaining([{ name, from: FROM }]),
      );
    });
  });

  // -------------------------------------------------------------------------
  // Namespace object auto-imports — one addImports call per namespace
  // -------------------------------------------------------------------------

  describe("setup — namespace objects", () => {
    const NAMESPACES = [
      "Dialog",
      "AlertDialog",
      "Popover",
      "Select",
      "Field",
      "Checkbox",
      "Switch",
      "Tooltip",
      "HoverCard",
      "Combobox",
      "TagsInput",
    ] as const;

    it.each(NAMESPACES)("registers %s namespace", (name) => {
      module.setup();
      expect(vi.mocked(addImports)).toHaveBeenCalledWith({ name, from: FROM });
    });
  });

  // -------------------------------------------------------------------------
  // Component auto-registration — addComponent per component, per primitive
  // -------------------------------------------------------------------------

  describe("setup — components", () => {
    describe("Dialog", () => {
      it.each(DIALOG_COMPONENTS)("registers %s", (name) => {
        module.setup();
        expect(vi.mocked(addComponent)).toHaveBeenCalledWith({ name, export: name, filePath: FROM });
      });
    });

    describe("AlertDialog", () => {
      it.each(ALERT_DIALOG_COMPONENTS)("registers %s", (name) => {
        module.setup();
        expect(vi.mocked(addComponent)).toHaveBeenCalledWith({ name, export: name, filePath: FROM });
      });
    });

    describe("Select", () => {
      it.each(SELECT_COMPONENTS)("registers %s", (name) => {
        module.setup();
        expect(vi.mocked(addComponent)).toHaveBeenCalledWith({ name, export: name, filePath: FROM });
      });
    });

    describe("Popover", () => {
      it.each(POPOVER_COMPONENTS)("registers %s", (name) => {
        module.setup();
        expect(vi.mocked(addComponent)).toHaveBeenCalledWith({ name, export: name, filePath: FROM });
      });
    });

    describe("Field", () => {
      it.each(FIELD_COMPONENTS)("registers %s", (name) => {
        module.setup();
        expect(vi.mocked(addComponent)).toHaveBeenCalledWith({ name, export: name, filePath: FROM });
      });
    });

    describe("Checkbox", () => {
      it.each(CHECKBOX_COMPONENTS)("registers %s", (name) => {
        module.setup();
        expect(vi.mocked(addComponent)).toHaveBeenCalledWith({ name, export: name, filePath: FROM });
      });
    });

    describe("Switch", () => {
      it.each(SWITCH_COMPONENTS)("registers %s", (name) => {
        module.setup();
        expect(vi.mocked(addComponent)).toHaveBeenCalledWith({ name, export: name, filePath: FROM });
      });
    });

    describe("Tooltip", () => {
      it.each(TOOLTIP_COMPONENTS)("registers %s", (name) => {
        module.setup();
        expect(vi.mocked(addComponent)).toHaveBeenCalledWith({ name, export: name, filePath: FROM });
      });
    });

    describe("HoverCard", () => {
      it.each(HOVER_CARD_COMPONENTS)("registers %s", (name) => {
        module.setup();
        expect(vi.mocked(addComponent)).toHaveBeenCalledWith({ name, export: name, filePath: FROM });
      });
    });

    describe("Combobox", () => {
      it.each(COMBOBOX_COMPONENTS)("registers %s", (name) => {
        module.setup();
        expect(vi.mocked(addComponent)).toHaveBeenCalledWith({ name, export: name, filePath: FROM });
      });
    });

    describe("TagsInput", () => {
      it.each(TAGS_INPUT_COMPONENTS)("registers %s", (name) => {
        module.setup();
        expect(vi.mocked(addComponent)).toHaveBeenCalledWith({ name, export: name, filePath: FROM });
      });
    });
  });
});
