import { addComponent, addImports, defineNuxtModule } from "@nuxt/kit";

export default defineNuxtModule({
  meta: {
    name: "@forge-ui/nuxt",
    configKey: "forgeUi",
    compatibility: { nuxt: ">=4.0.0" },
  },

  setup() {
    const from = "@forge-ui/vue";

    // ---------------------------------------------------------------------------
    // Composables — auto-imported in every .vue / .ts file
    // ---------------------------------------------------------------------------
    addImports([
      // Headless hooks (machine-level wrappers)
      { name: "useAvatar", from },
      { name: "injectAvatarContext", from },
      { name: "useDialog", from },
      { name: "useAlertDialog", from },
      { name: "usePopover", from },
      { name: "useSelect", from },
      { name: "useField", from },
      { name: "useCheckbox", from },
      { name: "useSwitch", from },
      { name: "useTooltip", from },
      { name: "useHoverCard", from },
      { name: "useCombobox", from },
      { name: "useTagsInput", from },
      { name: "useSlider", from },
      { name: "useAccordion", from },
      { name: "useCollapsible", from },
      { name: "useTabs", from },
      { name: "useRadioGroup", from },
      { name: "useNumberInput", from },
      { name: "useDateField", from },
      { name: "useDateFieldControlled", from },
      { name: "useTimePicker", from },
      { name: "useDatePicker", from },
      { name: "useDatePickerControlled", from },
      { name: "useDatePickerContext", from },
      { name: "useDateRangePicker", from },
      { name: "useDateRangePickerControlled", from },
      { name: "useDateRangePickerContext", from },
      { name: "useToggle", from },
      { name: "useToggleGroup", from },
      { name: "useMenu", from },
      // Low-level utilities
      { name: "useMachine", from },
      { name: "usePresence", from },
    ]);

    // ---------------------------------------------------------------------------
    // Namespace objects — enable <Dialog.Root>, <Accordion.Item>, etc. in templates.
    // Nuxt's auto-import injects these as script variables so the Vue template
    // compiler can resolve <Dialog.Root> via the `Dialog` binding. This works in
    // most cases; if dot-notation components aren't resolving in your templates
    // (especially under SSR), add an explicit import:
    //   import { Dialog } from '@forge-ui/vue'
    // Flat components (DialogRoot, etc.) below are always reliable — prefer them
    // when dot-notation isn't needed.
    // ---------------------------------------------------------------------------
    addImports([
      { name: "Avatar", from },
      { name: "Accordion", from },
      { name: "AlertDialog", from },
      { name: "Checkbox", from },
      { name: "Collapsible", from },
      { name: "Combobox", from },
      { name: "DateField", from },
      { name: "DatePicker", from },
      { name: "DateRangePicker", from },
      { name: "Dialog", from },
      { name: "Field", from },
      { name: "HoverCard", from },
      { name: "NumberInput", from },
      { name: "Popover", from },
      { name: "Progress", from },
      { name: "RadioGroup", from },
      { name: "Select", from },
      { name: "Separator", from },
      { name: "Slider", from },
      { name: "Switch", from },
      { name: "Tabs", from },
      { name: "TagsInput", from },
      { name: "TimePicker", from },
      { name: "Toggle", from },
      { name: "ToggleGroup", from },
      { name: "Tooltip", from },
      { name: "VisuallyHidden", from },
      { name: "Menu", from },
      { name: "ContextMenu", from },
    ]);

    // ---------------------------------------------------------------------------
    // Individual named components
    // These are registered as Nuxt components — no import needed in .vue files.
    // Prefer these over the namespace API for simpler templates.
    // ---------------------------------------------------------------------------

    const avatarComponents = ["AvatarRoot", "AvatarImage", "AvatarFallback"] as const;
    for (const name of avatarComponents) {
      addComponent({ name, export: name, filePath: from });
    }

    const accordionComponents = [
      "AccordionRoot",
      "AccordionItem",
      "AccordionHeader",
      "AccordionTrigger",
      "AccordionContent",
    ] as const;
    for (const name of accordionComponents) {
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

    const collapsibleComponents = [
      "CollapsibleRoot",
      "CollapsibleTrigger",
      "CollapsibleContent",
    ] as const;
    for (const name of collapsibleComponents) {
      addComponent({ name, export: name, filePath: from });
    }

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
      "ComboboxGroup",
      "ComboboxGroupLabel",
      "ComboboxCreateOption",
      "ComboboxTagsInput",
      "ComboboxTag",
      "ComboboxTagDelete",
    ] as const;
    for (const name of comboboxComponents) {
      addComponent({ name, export: name, filePath: from });
    }

    const dateFieldComponents = [
      "DateFieldRoot",
      "DateFieldGroup",
      "DateFieldMonthSegment",
      "DateFieldDaySegment",
      "DateFieldYearSegment",
      "DateFieldSeparator",
      "DateFieldHiddenInput",
    ] as const;
    for (const name of dateFieldComponents) {
      addComponent({ name, export: name, filePath: from });
    }

    const datePickerComponents = [
      "DatePickerRoot",
      "DatePickerTrigger",
      "DatePickerContent",
      "DatePickerCalendarHeader",
      "DatePickerViewSwitchButton",
      "DatePickerPrevMonthButton",
      "DatePickerNextMonthButton",
      "DatePickerPrevYearRangeButton",
      "DatePickerNextYearRangeButton",
      "DatePickerCalendarGrid",
      "DatePickerCalendarRow",
      "DatePickerWeekdayHeader",
      "DatePickerCalendarCell",
      "DatePickerMonthGrid",
      "DatePickerMonthCell",
      "DatePickerYearGrid",
      "DatePickerYearCell",
      "DatePickerPreset",
      "DatePickerHiddenInput",
    ] as const;
    for (const name of datePickerComponents) {
      addComponent({ name, export: name, filePath: from });
    }

    const dateRangePickerComponents = [
      "DateRangePickerRoot",
      "DateRangePickerTrigger",
      "DateRangePickerContent",
      "DateRangePickerCalendarHeader",
      "DateRangePickerPrevMonthButton",
      "DateRangePickerNextMonthButton",
      "DateRangePickerCalendarGrid",
      "DateRangePickerCalendarRow",
      "DateRangePickerWeekdayHeader",
      "DateRangePickerCalendarCell",
      "DateRangePickerClearButton",
      "DateRangePickerPreset",
      "DateRangePickerHiddenInputs",
    ] as const;
    for (const name of dateRangePickerComponents) {
      addComponent({ name, export: name, filePath: from });
    }

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

    const hoverCardComponents = [
      "HoverCardRoot",
      "HoverCardTrigger",
      "HoverCardPortal",
      "HoverCardContent",
      "HoverCardArrow",
    ] as const;
    for (const name of hoverCardComponents) {
      addComponent({ name, export: name, filePath: from });
    }

    const numberInputComponents = [
      "NumberInputRoot",
      "NumberInputControl",
      "NumberInputInput",
      "NumberInputIncrementTrigger",
      "NumberInputDecrementTrigger",
      "NumberInputHiddenInput",
      "NumberInputLabel",
    ] as const;
    for (const name of numberInputComponents) {
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

    const progressComponents = [
      "ProgressRoot",
      "ProgressTrack",
      "ProgressFill",
      "ProgressLabel",
      "ProgressValueText",
    ] as const;
    for (const name of progressComponents) {
      addComponent({ name, export: name, filePath: from });
    }

    const radioGroupComponents = [
      "RadioGroupRoot",
      "RadioGroupItem",
      "RadioGroupRadio",
      "RadioGroupLabel",
      "RadioGroupHiddenInput",
    ] as const;
    for (const name of radioGroupComponents) {
      addComponent({ name, export: name, filePath: from });
    }

    const selectComponents = [
      "SelectRoot",
      "SelectLabel",
      "SelectTrigger",
      "SelectValue",
      "SelectPlaceholder",
      "SelectIndicator",
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

    const separatorComponents = ["SeparatorRoot"] as const;
    for (const name of separatorComponents) {
      addComponent({ name, export: name, filePath: from });
    }

    const sliderComponents = [
      "SliderRoot",
      "SliderTrack",
      "SliderRange",
      "SliderThumb",
      "SliderHiddenInput",
      "SliderMarkerGroup",
      "SliderMarker",
    ] as const;
    for (const name of sliderComponents) {
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

    const tabsComponents = [
      "TabsRoot",
      "TabsList",
      "TabsTrigger",
      "TabsPanel",
    ] as const;
    for (const name of tabsComponents) {
      addComponent({ name, export: name, filePath: from });
    }

    const tagsInputComponents = [
      "TagsInputRoot",
      "TagsInputLabel",
      "TagsInputInput",
      "TagsInputTag",
      "TagsInputTagDelete",
      "TagsInputHiddenInput",
    ] as const;
    for (const name of tagsInputComponents) {
      addComponent({ name, export: name, filePath: from });
    }

    const timePickerComponents = [
      "TimePickerRoot",
      "TimePickerGroup",
      "TimePickerHoursSegment",
      "TimePickerMinutesSegment",
      "TimePickerSecondsSegment",
      "TimePickerPeriodSegment",
      "TimePickerSeparator",
      "TimePickerHiddenInput",
    ] as const;
    for (const name of timePickerComponents) {
      addComponent({ name, export: name, filePath: from });
    }

    const toggleComponents = ["ToggleRoot"] as const;
    for (const name of toggleComponents) {
      addComponent({ name, export: name, filePath: from });
    }

    const toggleGroupComponents = ["ToggleGroupRoot", "ToggleGroupItem"] as const;
    for (const name of toggleGroupComponents) {
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
    for (const name of tooltipComponents) {
      addComponent({ name, export: name, filePath: from });
    }

    const visuallyHiddenComponents = ["VisuallyHiddenRoot"] as const;
    for (const name of visuallyHiddenComponents) {
      addComponent({ name, export: name, filePath: from });
    }

    const menuComponents = [
      "MenuRoot",
      "MenuTrigger",
      "MenuPortal",
      "MenuContent",
      "MenuArrow",
      "MenuItem",
      "MenuLabel",
      "MenuSeparator",
      "MenuGroup",
      "MenuGroupLabel",
      "MenuRadioGroup",
      "MenuRadioGroupLabel",
      "MenuRadioItem",
      "MenuCheckboxItem",
      "MenuItemIndicator",
      "MenuSub",
      "MenuSubTrigger",
      "MenuSubContent",
    ] as const;
    for (const name of menuComponents) {
      addComponent({ name, export: name, filePath: from });
    }

    const contextMenuComponents = [
      "ContextMenuRoot",
      "ContextMenuTrigger",
      "ContextMenuPortal",
      "ContextMenuContent",
      "ContextMenuItem",
      "ContextMenuLabel",
      "ContextMenuSeparator",
      "ContextMenuGroup",
      "ContextMenuGroupLabel",
      "ContextMenuRadioGroup",
      "ContextMenuRadioGroupLabel",
      "ContextMenuRadioItem",
      "ContextMenuCheckboxItem",
      "ContextMenuItemIndicator",
    ] as const;
    for (const name of contextMenuComponents) {
      addComponent({ name, export: name, filePath: from });
    }
  },
});
