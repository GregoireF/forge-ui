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
  "SelectIndicator", "SelectPortal", "SelectContent", "SelectItem", "SelectItemText",
  "SelectItemIndicator", "SelectSeparator", "SelectGroup", "SelectGroupLabel",
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
  "ComboboxCreateOption", "ComboboxTagsInput", "ComboboxTag", "ComboboxTagDelete",
] as const;

const TAGS_INPUT_COMPONENTS = [
  "TagsInputRoot", "TagsInputLabel", "TagsInputInput", "TagsInputTag",
  "TagsInputTagDelete", "TagsInputHiddenInput",
] as const;

const ACCORDION_COMPONENTS = [
  "AccordionRoot", "AccordionItem", "AccordionHeader", "AccordionTrigger", "AccordionContent",
] as const;

const COLLAPSIBLE_COMPONENTS = [
  "CollapsibleRoot", "CollapsibleTrigger", "CollapsibleContent",
] as const;

const DATE_FIELD_COMPONENTS = [
  "DateFieldRoot", "DateFieldGroup", "DateFieldMonthSegment", "DateFieldDaySegment",
  "DateFieldYearSegment", "DateFieldSeparator", "DateFieldHiddenInput",
] as const;

const DATE_PICKER_COMPONENTS = [
  "DatePickerRoot", "DatePickerTrigger", "DatePickerContent",
  "DatePickerCalendarHeader", "DatePickerViewSwitchButton",
  "DatePickerPrevMonthButton", "DatePickerNextMonthButton",
  "DatePickerPrevYearRangeButton", "DatePickerNextYearRangeButton",
  "DatePickerCalendarGrid", "DatePickerCalendarRow", "DatePickerWeekdayHeader",
  "DatePickerCalendarCell", "DatePickerMonthGrid", "DatePickerMonthCell",
  "DatePickerYearGrid", "DatePickerYearCell", "DatePickerPreset", "DatePickerHiddenInput",
] as const;

const DATE_RANGE_PICKER_COMPONENTS = [
  "DateRangePickerRoot", "DateRangePickerTrigger", "DateRangePickerContent",
  "DateRangePickerCalendarHeader", "DateRangePickerPrevMonthButton",
  "DateRangePickerNextMonthButton", "DateRangePickerCalendarGrid",
  "DateRangePickerCalendarRow", "DateRangePickerWeekdayHeader",
  "DateRangePickerCalendarCell", "DateRangePickerClearButton",
  "DateRangePickerPreset", "DateRangePickerHiddenInputs",
] as const;

const NUMBER_INPUT_COMPONENTS = [
  "NumberInputRoot", "NumberInputControl", "NumberInputInput",
  "NumberInputIncrementTrigger", "NumberInputDecrementTrigger",
  "NumberInputHiddenInput", "NumberInputLabel",
] as const;

const PROGRESS_COMPONENTS = [
  "ProgressRoot", "ProgressTrack", "ProgressFill", "ProgressLabel", "ProgressValueText",
] as const;

const RADIO_GROUP_COMPONENTS = [
  "RadioGroupRoot", "RadioGroupItem", "RadioGroupRadio", "RadioGroupLabel", "RadioGroupHiddenInput",
] as const;

const SEPARATOR_COMPONENTS = ["SeparatorRoot"] as const;

const SLIDER_COMPONENTS = [
  "SliderRoot", "SliderTrack", "SliderRange", "SliderThumb",
  "SliderHiddenInput", "SliderMarkerGroup", "SliderMarker",
] as const;

const TABS_COMPONENTS = ["TabsRoot", "TabsList", "TabsTrigger", "TabsPanel"] as const;

const TIME_PICKER_COMPONENTS = [
  "TimePickerRoot", "TimePickerGroup", "TimePickerHoursSegment",
  "TimePickerMinutesSegment", "TimePickerSecondsSegment", "TimePickerPeriodSegment",
  "TimePickerSeparator", "TimePickerHiddenInput",
] as const;

const TOGGLE_COMPONENTS = ["ToggleRoot"] as const;

const TOGGLE_GROUP_COMPONENTS = ["ToggleGroupRoot", "ToggleGroupItem"] as const;

const VISUALLY_HIDDEN_COMPONENTS = ["VisuallyHiddenRoot"] as const;

const MENU_COMPONENTS = [
  "MenuRoot", "MenuTrigger", "MenuPortal", "MenuContent", "MenuArrow",
  "MenuItem", "MenuLabel", "MenuSeparator", "MenuGroup", "MenuGroupLabel",
  "MenuRadioGroup", "MenuRadioGroupLabel", "MenuRadioItem",
  "MenuCheckboxItem", "MenuItemIndicator",
  "MenuSub", "MenuSubTrigger", "MenuSubContent",
] as const;

const CONTEXT_MENU_COMPONENTS = [
  "ContextMenuRoot", "ContextMenuTrigger", "ContextMenuPortal", "ContextMenuContent",
  "ContextMenuItem", "ContextMenuLabel", "ContextMenuSeparator",
  "ContextMenuGroup", "ContextMenuGroupLabel",
  "ContextMenuRadioGroup", "ContextMenuRadioGroupLabel",
  "ContextMenuRadioItem", "ContextMenuCheckboxItem", "ContextMenuItemIndicator",
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
  // Composable auto-imports
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
      "useTagsInput",
      "useSlider",
      "useAccordion",
      "useCollapsible",
      "useTabs",
      "useRadioGroup",
      "useNumberInput",
      "useDateField",
      "useDateFieldControlled",
      "useTimePicker",
      "useDatePicker",
      "useDatePickerControlled",
      "useDatePickerContext",
      "useDateRangePicker",
      "useDateRangePickerControlled",
      "useDateRangePickerContext",
      "useToggle",
      "useToggleGroup",
      "useMenu",
      "useMachine",
      "usePresence",
    ] as const;

    it.each(ALL_COMPOSABLES)("registers %s in the composables batch", (name) => {
      module.setup();
      expect(vi.mocked(addImports)).toHaveBeenCalledWith(
        expect.arrayContaining([{ name, from: FROM }]),
      );
    });
  });

  // -------------------------------------------------------------------------
  // Namespace object auto-imports — registered as one batch array
  // -------------------------------------------------------------------------

  describe("setup — namespace objects", () => {
    const NAMESPACES = [
      "Accordion",
      "AlertDialog",
      "Checkbox",
      "Collapsible",
      "Combobox",
      "ContextMenu",
      "DateField",
      "DatePicker",
      "DateRangePicker",
      "Dialog",
      "Field",
      "HoverCard",
      "Menu",
      "NumberInput",
      "Popover",
      "Progress",
      "RadioGroup",
      "Select",
      "Separator",
      "Slider",
      "Switch",
      "Tabs",
      "TagsInput",
      "TimePicker",
      "Toggle",
      "ToggleGroup",
      "Tooltip",
      "VisuallyHidden",
    ] as const;

    it.each(NAMESPACES)("registers %s namespace in the namespaces batch", (name) => {
      module.setup();
      expect(vi.mocked(addImports)).toHaveBeenCalledWith(
        expect.arrayContaining([{ name, from: FROM }]),
      );
    });
  });

  // -------------------------------------------------------------------------
  // Component auto-registration — addComponent per component, per primitive
  // -------------------------------------------------------------------------

  describe("setup — components", () => {
    describe("Accordion", () => {
      it.each(ACCORDION_COMPONENTS)("registers %s", (name) => {
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

    describe("Checkbox", () => {
      it.each(CHECKBOX_COMPONENTS)("registers %s", (name) => {
        module.setup();
        expect(vi.mocked(addComponent)).toHaveBeenCalledWith({ name, export: name, filePath: FROM });
      });
    });

    describe("Collapsible", () => {
      it.each(COLLAPSIBLE_COMPONENTS)("registers %s", (name) => {
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

    describe("ContextMenu", () => {
      it.each(CONTEXT_MENU_COMPONENTS)("registers %s", (name) => {
        module.setup();
        expect(vi.mocked(addComponent)).toHaveBeenCalledWith({ name, export: name, filePath: FROM });
      });
    });

    describe("DateField", () => {
      it.each(DATE_FIELD_COMPONENTS)("registers %s", (name) => {
        module.setup();
        expect(vi.mocked(addComponent)).toHaveBeenCalledWith({ name, export: name, filePath: FROM });
      });
    });

    describe("DatePicker", () => {
      it.each(DATE_PICKER_COMPONENTS)("registers %s", (name) => {
        module.setup();
        expect(vi.mocked(addComponent)).toHaveBeenCalledWith({ name, export: name, filePath: FROM });
      });
    });

    describe("DateRangePicker", () => {
      it.each(DATE_RANGE_PICKER_COMPONENTS)("registers %s", (name) => {
        module.setup();
        expect(vi.mocked(addComponent)).toHaveBeenCalledWith({ name, export: name, filePath: FROM });
      });
    });

    describe("Dialog", () => {
      it.each(DIALOG_COMPONENTS)("registers %s", (name) => {
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

    describe("HoverCard", () => {
      it.each(HOVER_CARD_COMPONENTS)("registers %s", (name) => {
        module.setup();
        expect(vi.mocked(addComponent)).toHaveBeenCalledWith({ name, export: name, filePath: FROM });
      });
    });

    describe("Menu", () => {
      it.each(MENU_COMPONENTS)("registers %s", (name) => {
        module.setup();
        expect(vi.mocked(addComponent)).toHaveBeenCalledWith({ name, export: name, filePath: FROM });
      });
    });

    describe("NumberInput", () => {
      it.each(NUMBER_INPUT_COMPONENTS)("registers %s", (name) => {
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

    describe("Progress", () => {
      it.each(PROGRESS_COMPONENTS)("registers %s", (name) => {
        module.setup();
        expect(vi.mocked(addComponent)).toHaveBeenCalledWith({ name, export: name, filePath: FROM });
      });
    });

    describe("RadioGroup", () => {
      it.each(RADIO_GROUP_COMPONENTS)("registers %s", (name) => {
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

    describe("Separator", () => {
      it.each(SEPARATOR_COMPONENTS)("registers %s", (name) => {
        module.setup();
        expect(vi.mocked(addComponent)).toHaveBeenCalledWith({ name, export: name, filePath: FROM });
      });
    });

    describe("Slider", () => {
      it.each(SLIDER_COMPONENTS)("registers %s", (name) => {
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

    describe("Tabs", () => {
      it.each(TABS_COMPONENTS)("registers %s", (name) => {
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

    describe("TimePicker", () => {
      it.each(TIME_PICKER_COMPONENTS)("registers %s", (name) => {
        module.setup();
        expect(vi.mocked(addComponent)).toHaveBeenCalledWith({ name, export: name, filePath: FROM });
      });
    });

    describe("Toggle", () => {
      it.each(TOGGLE_COMPONENTS)("registers %s", (name) => {
        module.setup();
        expect(vi.mocked(addComponent)).toHaveBeenCalledWith({ name, export: name, filePath: FROM });
      });
    });

    describe("ToggleGroup", () => {
      it.each(TOGGLE_GROUP_COMPONENTS)("registers %s", (name) => {
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

    describe("VisuallyHidden", () => {
      it.each(VISUALLY_HIDDEN_COMPONENTS)("registers %s", (name) => {
        module.setup();
        expect(vi.mocked(addComponent)).toHaveBeenCalledWith({ name, export: name, filePath: FROM });
      });
    });
  });
});
