# @forge-ui/nuxt

Nuxt 4 module for forge-ui. Auto-imports all Vue components and composables — no explicit imports needed anywhere.

## Install

```bash
npm install @forge-ui/nuxt
```

## Setup

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@forge-ui/nuxt'],
})
```

## Usage

Everything is available without imports:

```vue
<!-- pages/index.vue — zero imports -->
<template>
  <Dialog.Root>
    <Dialog.Trigger>Open</Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay />
      <Dialog.Content>
        <Dialog.Title>Hello</Dialog.Title>
        <Dialog.Close>Close</Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>

  <Select.Root v-model:value="val">
    <Select.Trigger><Select.Value placeholder="Pick…" /></Select.Trigger>
    <Select.Portal>
      <Select.Content>
        <Select.Item value="a"><Select.ItemText>Option A</Select.ItemText></Select.Item>
      </Select.Content>
    </Select.Portal>
  </Select.Root>
</template>
```

```vue
<script setup>
// Composables are auto-imported too
const dialog = useDialog()
const select = useSelect()
</script>
```

---

## Auto-imported components

### Dialog
`Dialog` · `DialogRoot` · `DialogTrigger` · `DialogPortal` · `DialogOverlay` · `DialogContent` · `DialogTitle` · `DialogDescription` · `DialogClose`

### Alert Dialog
`AlertDialog` · `AlertDialogRoot` · `AlertDialogTrigger` · `AlertDialogPortal` · `AlertDialogOverlay` · `AlertDialogContent` · `AlertDialogTitle` · `AlertDialogDescription` · `AlertDialogCancel` · `AlertDialogAction`

### Popover
`Popover` · `PopoverRoot` · `PopoverTrigger` · `PopoverAnchor` · `PopoverPortal` · `PopoverContent` · `PopoverArrow` · `PopoverClose` · `PopoverTitle` · `PopoverDescription`

### Select
`Select` · `SelectRoot` · `SelectLabel` · `SelectTrigger` · `SelectValue` · `SelectPlaceholder` · `SelectPortal` · `SelectContent` · `SelectItem` · `SelectItemText` · `SelectItemIndicator` · `SelectSeparator` · `SelectGroup` · `SelectGroupLabel` · `SelectIndicator`

### Combobox
`Combobox` · `ComboboxRoot` · `ComboboxLabel` · `ComboboxInput` · `ComboboxTrigger` · `ComboboxClearTrigger` · `ComboboxPortal` · `ComboboxContent` · `ComboboxItem` · `ComboboxItemText` · `ComboboxItemIndicator` · `ComboboxGroup` · `ComboboxGroupLabel` · `ComboboxCreateOption` · `ComboboxTagsInput` · `ComboboxTag` · `ComboboxTagDelete`

### Checkbox
`Checkbox` · `CheckboxRoot` · `CheckboxControl` · `CheckboxIndicator` · `CheckboxLabel` · `CheckboxGroup` · `CheckboxGroupAll`

### Radio Group
`RadioGroup` · `RadioGroupRoot` · `RadioGroupItem` · `RadioGroupLabel` · `RadioGroupRadio` · `RadioGroupHiddenInput`

### Switch
`Switch` · `SwitchRoot` · `SwitchControl` · `SwitchThumb` · `SwitchLabel`

### Slider
`Slider` · `SliderRoot` · `SliderTrack` · `SliderRange` · `SliderThumb` · `SliderHiddenInput` · `SliderMarkerGroup` · `SliderMarker`

### Number Input
`NumberInput` · `NumberInputRoot` · `NumberInputLabel` · `NumberInputInput` · `NumberInputIncrementTrigger` · `NumberInputDecrementTrigger` · `NumberInputControl` · `NumberInputHiddenInput`

### Tags Input
`TagsInput` · `TagsInputRoot` · `TagsInputLabel` · `TagsInputInput` · `TagsInputTag` · `TagsInputTagDelete` · `TagsInputHiddenInput`

### Field
`Field` · `FieldRoot` · `FieldLabel` · `FieldRequiredIndicator` · `FieldControl` · `FieldDescription` · `FieldError` · `FieldGroup` · `FieldGroupLabel`

### Tooltip
`Tooltip` · `TooltipProvider` · `TooltipRoot` · `TooltipTrigger` · `TooltipAnchor` · `TooltipPortal` · `TooltipContent` · `TooltipArrow`

### Hover Card
`HoverCard` · `HoverCardRoot` · `HoverCardTrigger` · `HoverCardPortal` · `HoverCardContent` · `HoverCardArrow`

### Accordion
`Accordion` · `AccordionRoot` · `AccordionItem` · `AccordionHeader` · `AccordionTrigger` · `AccordionContent`

### Collapsible
`Collapsible` · `CollapsibleRoot` · `CollapsibleTrigger` · `CollapsibleContent`

### Tabs
`Tabs` · `TabsRoot` · `TabsList` · `TabsTrigger` · `TabsPanel`

### Progress
`Progress` · `ProgressRoot` · `ProgressTrack` · `ProgressFill` · `ProgressLabel` · `ProgressValueText`

### Date Field
`DateField` · `DateFieldRoot` · `DateFieldGroup` · `DateFieldMonthSegment` · `DateFieldDaySegment` · `DateFieldYearSegment` · `DateFieldSeparator` · `DateFieldHiddenInput`

### Time Picker
`TimePicker` · `TimePickerRoot` · `TimePickerGroup` · `TimePickerHoursSegment` · `TimePickerMinutesSegment` · `TimePickerSecondsSegment` · `TimePickerPeriodSegment` · `TimePickerSeparator` · `TimePickerHiddenInput`

### Date Picker
`DatePicker` · `DatePickerRoot` · `DatePickerTrigger` · `DatePickerContent` · `DatePickerCalendarHeader` · `DatePickerViewSwitchButton` · `DatePickerPrevMonthButton` · `DatePickerNextMonthButton` · `DatePickerPrevYearRangeButton` · `DatePickerNextYearRangeButton` · `DatePickerCalendarGrid` · `DatePickerCalendarRow` · `DatePickerWeekdayHeader` · `DatePickerCalendarCell` · `DatePickerMonthGrid` · `DatePickerMonthCell` · `DatePickerYearGrid` · `DatePickerYearCell` · `DatePickerPreset` · `DatePickerHiddenInput`

### Date Range Picker
`DateRangePicker` · `DateRangePickerRoot` · `DateRangePickerTrigger` · `DateRangePickerContent` · `DateRangePickerCalendarHeader` · `DateRangePickerPrevMonthButton` · `DateRangePickerNextMonthButton` · `DateRangePickerCalendarGrid` · `DateRangePickerCalendarRow` · `DateRangePickerWeekdayHeader` · `DateRangePickerCalendarCell` · `DateRangePickerClearButton` · `DateRangePickerPreset` · `DateRangePickerHiddenInputs`

---

## Auto-imported composables

| Composable | Description |
|---|---|
| `useDialog` | Dialog open/close state + prop getters |
| `useAlertDialog` | Alert dialog (non-dismissible) |
| `usePopover` | Popover state |
| `useTooltip` | Tooltip state |
| `useHoverCard` | Hover card state |
| `useSelect` | Select state |
| `useCombobox` | Combobox state + filter |
| `useCheckbox` | Checkbox state |
| `useCheckboxGroup` | Checkbox group (select-all) |
| `useRadioGroup` | Radio group state |
| `useSwitch` | Switch state |
| `useSlider` | Slider state + drag |
| `useNumberInput` | Number input state + spin |
| `useTagsInput` | Tags input state |
| `useField` | Field ID provider |
| `useAccordion` | Accordion state |
| `useTabs` | Tabs state |
| `useDateField` | Date field state |
| `useDateFieldControlled` | Controlled date field |
| `useTimePicker` | Time picker state |
| `useDatePicker` | Date picker state |
| `useDatePickerControlled` | Controlled date picker |
| `useDateRangePicker` | Date range picker state |
| `useDateRangePickerControlled` | Controlled date range picker |
| `usePresence` | DOM presence (delays unmount until CSS transition ends) |
| `useMachine` | Low-level machine binding |

---

## Peer dependencies

- `nuxt >= 4.0.0`
- `@forge-ui/vue` (installed automatically as a dependency)
