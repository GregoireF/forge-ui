# @forge-ui/nuxt

Nuxt 4 module for forge-ui — auto-imports all components and composables.

## Installation

```bash
npm install @forge-ui/nuxt
# or
bun add @forge-ui/nuxt
```

## Setup

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@forge-ui/nuxt'],
})
```

That's it. No further configuration required.

---

## Two APIs — choose one

forge-ui exposes two equivalent APIs. Both are supported in Nuxt.

### 1. Flat API (recommended for Nuxt — zero imports)

Individual components are registered as Nuxt auto-imports. No `import` statement ever needed.

```vue
<!-- pages/my-page.vue — no import -->
<template>
  <DialogRoot>
    <DialogTrigger>Open</DialogTrigger>
    <DialogPortal>
      <DialogOverlay />
      <DialogContent>
        <DialogTitle>Title</DialogTitle>
        <DialogDescription>Description.</DialogDescription>
        <DialogClose>Close</DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
```

### 2. Namespace API (dot notation — one import per namespace)

Namespace objects (`Dialog`, `Accordion`, etc.) must be explicitly imported from `@forge-ui/vue`.
This is not a module limitation — it is how Vue's template compiler works: `<Dialog.Root>` resolves
`Dialog` as a script variable, so the compiler needs to see the actual `import` in the file.

```vue
<script setup lang="ts">
// One import per namespace you use
import { Dialog, Accordion, Tabs } from '@forge-ui/vue'
</script>

<template>
  <Dialog.Root>
    <Dialog.Trigger>Open</Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay />
      <Dialog.Content>
        <Dialog.Title>Title</Dialog.Title>
        <Dialog.Close>Close</Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
</template>
```

> **Summary:** Use flat API (`<DialogRoot>`) → zero imports. Use namespace API (`<Dialog.Root>`) → one import per namespace used.

---

## Composables

All composables are auto-imported — no import statement needed.

```vue
<script setup lang="ts">
// No import — useDialog is auto-imported
const dialog = useDialog({
  onOpenChange: (open) => console.log('open:', open),
})
</script>

<template>
  <button v-bind="dialog.getTriggerProps()">Open</button>
  <template v-if="dialog.isOpen.value">
    <DialogPortal>
      <div v-bind="dialog.getOverlayProps()" />
      <div v-bind="dialog.getContentProps()">
        <h2 v-bind="dialog.getTitleProps()">Hook dialog</h2>
        <button v-bind="dialog.getCloseProps()">Close</button>
      </div>
    </DialogPortal>
  </template>
</template>
```

---

## Complete examples by primitive

### Dialog

```vue
<template>
  <!-- Uncontrolled -->
  <DialogRoot>
    <DialogTrigger>Open dialog</DialogTrigger>
    <DialogPortal>
      <DialogOverlay style="position:fixed;inset:0;background:rgb(0 0 0/0.4)" />
      <DialogContent style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;padding:2rem;border-radius:8px">
        <DialogTitle>Account settings</DialogTitle>
        <DialogDescription>Make changes to your profile.</DialogDescription>
        <DialogClose>Save changes</DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>

  <!-- Controlled with v-model -->
  <DialogRoot :open="isOpen" :on-open-change="(v) => isOpen = v">
    <DialogPortal>
      <DialogOverlay style="position:fixed;inset:0;background:rgb(0 0 0/0.4)" />
      <DialogContent style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;padding:2rem">
        <DialogTitle>Controlled dialog</DialogTitle>
        <DialogClose>Close</DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup lang="ts">
const isOpen = ref(false)
</script>
```

### AlertDialog (non-dismissible confirmation)

```vue
<template>
  <AlertDialogRoot>
    <AlertDialogTrigger style="background:red;color:#fff;padding:0.5rem 1rem">Delete account</AlertDialogTrigger>
    <AlertDialogPortal>
      <AlertDialogOverlay style="position:fixed;inset:0;background:rgb(0 0 0/0.4)" />
      <AlertDialogContent style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;padding:2rem">
        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
        <AlertDialogDescription>This action is irreversible. Escape and outside-click are disabled.</AlertDialogDescription>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction @click="handleDelete">Delete</AlertDialogAction>
      </AlertDialogContent>
    </AlertDialogPortal>
  </AlertDialogRoot>
</template>
```

### Select

```vue
<template>
  <!-- Single select -->
  <SelectRoot :on-value-change="(v) => selected = v">
    <SelectLabel>Framework</SelectLabel>
    <SelectTrigger>
      <SelectValue placeholder="Choose…" />
    </SelectTrigger>
    <SelectPortal>
      <SelectContent>
        <SelectItem value="react">React</SelectItem>
        <SelectItem value="vue">Vue</SelectItem>
        <SelectItem value="nuxt">Nuxt</SelectItem>
        <SelectSeparator />
        <SelectGroup>
          <SelectGroupLabel>Others</SelectGroupLabel>
          <SelectItem value="svelte">Svelte</SelectItem>
          <SelectItem value="solid" :disabled="true">Solid (disabled)</SelectItem>
        </SelectGroup>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>

  <!-- Multiple select -->
  <SelectRoot :multiple="true" :on-value-change="(v) => selected = v">
    <SelectTrigger>
      <SelectValue placeholder="Select multiple…" />
    </SelectTrigger>
    <SelectPortal>
      <SelectContent>
        <SelectItem value="ts">TypeScript</SelectItem>
        <SelectItem value="go">Go</SelectItem>
        <SelectItem value="rust">Rust</SelectItem>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>

<script setup lang="ts">
const selected = ref<string[]>([])
</script>
```

### Checkbox

```vue
<template>
  <!-- Uncontrolled -->
  <CheckboxRoot :default-checked="true">
    <CheckboxControl>
      <CheckboxIndicator>✓</CheckboxIndicator>
    </CheckboxControl>
    <CheckboxLabel>Accept terms</CheckboxLabel>
  </CheckboxRoot>

  <!-- Controlled (tri-state) -->
  <CheckboxRoot :checked="checked" :on-checked-change="(v) => checked = v">
    <CheckboxControl>
      <CheckboxIndicator>{{ checked === 'indeterminate' ? '—' : '✓' }}</CheckboxIndicator>
    </CheckboxControl>
    <CheckboxLabel>Controlled — {{ String(checked) }}</CheckboxLabel>
  </CheckboxRoot>

  <!-- Checkbox group with select-all -->
  <CheckboxGroup v-model:value="groupValues">
    <CheckboxGroupAll>
      <CheckboxControl><CheckboxIndicator>✓</CheckboxIndicator></CheckboxControl>
      <CheckboxLabel>Select all</CheckboxLabel>
    </CheckboxGroupAll>
    <CheckboxRoot v-for="item in items" :key="item.value" :value="item.value">
      <CheckboxControl><CheckboxIndicator>✓</CheckboxIndicator></CheckboxControl>
      <CheckboxLabel>{{ item.label }}</CheckboxLabel>
    </CheckboxRoot>
  </CheckboxGroup>
</template>

<script setup lang="ts">
const checked = ref<boolean | 'indeterminate'>('indeterminate')
const groupValues = ref<string[]>(['react'])
const items = [{ value: 'react', label: 'React' }, { value: 'vue', label: 'Vue' }]
</script>
```

### Accordion

```vue
<template>
  <AccordionRoot type="single" :collapsible="true">
    <AccordionItem value="item-1">
      <AccordionHeader>
        <AccordionTrigger>Section 1</AccordionTrigger>
      </AccordionHeader>
      <AccordionContent>Content for section 1.</AccordionContent>
    </AccordionItem>

    <AccordionItem value="item-2">
      <AccordionHeader>
        <AccordionTrigger>Section 2</AccordionTrigger>
      </AccordionHeader>
      <AccordionContent>Content for section 2.</AccordionContent>
    </AccordionItem>
  </AccordionRoot>

  <!-- Multiple open at once -->
  <AccordionRoot type="multiple">
    <AccordionItem value="a">
      <AccordionHeader><AccordionTrigger>A</AccordionTrigger></AccordionHeader>
      <AccordionContent>Content A.</AccordionContent>
    </AccordionItem>
    <AccordionItem value="b">
      <AccordionHeader><AccordionTrigger>B</AccordionTrigger></AccordionHeader>
      <AccordionContent>Content B.</AccordionContent>
    </AccordionItem>
  </AccordionRoot>
</template>
```

### Tabs

```vue
<template>
  <TabsRoot default-value="tab1">
    <TabsList>
      <TabsTrigger value="tab1">React</TabsTrigger>
      <TabsTrigger value="tab2">Vue</TabsTrigger>
      <TabsTrigger value="tab3">Nuxt</TabsTrigger>
    </TabsList>
    <TabsPanel value="tab1">React content.</TabsPanel>
    <TabsPanel value="tab2">Vue content.</TabsPanel>
    <TabsPanel value="tab3">Nuxt content.</TabsPanel>
  </TabsRoot>
</template>
```

### Progress

```vue
<template>
  <ProgressRoot :value="progress" :max="100">
    <ProgressLabel>Loading</ProgressLabel>
    <ProgressValueText />
    <ProgressTrack>
      <ProgressFill />
    </ProgressTrack>
  </ProgressRoot>
</template>

<script setup lang="ts">
const progress = ref(60)
</script>
```

### RadioGroup

```vue
<template>
  <RadioGroupRoot :value="selected" :on-value-change="(v) => selected = v" name="plan">
    <RadioGroupItem v-for="opt in options" :key="opt.value" :value="opt.value">
      <RadioGroupRadio />
      <RadioGroupLabel>{{ opt.label }}</RadioGroupLabel>
      <RadioGroupHiddenInput />
    </RadioGroupItem>
  </RadioGroupRoot>
</template>

<script setup lang="ts">
const selected = ref('monthly')
const options = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual (save 20%)' },
]
</script>
```

### Slider

```vue
<template>
  <SliderRoot
    :value="value"
    :on-value-change="(v) => value = v[0] ?? 0"
    :min="0"
    :max="100"
    :step="1"
  >
    <SliderTrack>
      <SliderRange />
    </SliderTrack>
    <SliderThumb aria-label="Volume" />
  </SliderRoot>
  <p>Value: {{ value }}</p>
</template>

<script setup lang="ts">
const value = ref(50)
</script>
```

### NumberInput

```vue
<template>
  <NumberInputRoot :default-value="0" :min="0" :max="99" :step="1">
    <NumberInputLabel>Quantity</NumberInputLabel>
    <NumberInputDecrementTrigger>−</NumberInputDecrementTrigger>
    <NumberInputInput aria-label="Quantity" />
    <NumberInputIncrementTrigger>+</NumberInputIncrementTrigger>
    <NumberInputHiddenInput name="quantity" />
  </NumberInputRoot>
</template>
```

### Tooltip

```vue
<template>
  <!-- TooltipProvider wraps multiple tooltips — place at layout level -->
  <TooltipProvider :open-delay="400">
    <TooltipRoot>
      <TooltipTrigger>Hover me</TooltipTrigger>
      <TooltipPortal>
        <TooltipContent>Tooltip text</TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>
```

### Popover

```vue
<template>
  <PopoverRoot>
    <PopoverTrigger>Open popover</PopoverTrigger>
    <PopoverPortal>
      <PopoverContent>
        <PopoverTitle>Popover</PopoverTitle>
        <PopoverDescription>Non-modal — outside-click and Escape close it.</PopoverDescription>
        <PopoverClose>×</PopoverClose>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
```

### Switch

```vue
<template>
  <SwitchRoot :checked="on" :on-checked-change="(v) => on = v">
    <SwitchControl>
      <SwitchThumb />
    </SwitchControl>
    <SwitchLabel>Dark mode</SwitchLabel>
  </SwitchRoot>
</template>

<script setup lang="ts">
const on = ref(false)
</script>
```

### Collapsible

```vue
<template>
  <CollapsibleRoot>
    <CollapsibleTrigger>Toggle content</CollapsibleTrigger>
    <CollapsibleContent>Hidden content revealed on click.</CollapsibleContent>
  </CollapsibleRoot>
</template>
```

### Field

```vue
<template>
  <FieldRoot id="email-field" :invalid="invalid" :required="true">
    <FieldLabel>Email <FieldRequiredIndicator>*</FieldRequiredIndicator></FieldLabel>
    <FieldControl>
      <input v-model="email" type="email" placeholder="you@example.com" />
    </FieldControl>
    <FieldDescription>We'll never share your email.</FieldDescription>
    <FieldError>Invalid email address.</FieldError>
  </FieldRoot>
</template>

<script setup lang="ts">
const email = ref('')
const invalid = computed(() => email.value.length > 0 && !email.value.includes('@'))
</script>
```

### Combobox

```vue
<template>
  <ComboboxRoot :on-value-change="(v) => selected = v">
    <ComboboxLabel>Language</ComboboxLabel>
    <ComboboxInput placeholder="Search…" />
    <ComboboxTrigger>▾</ComboboxTrigger>
    <ComboboxPortal>
      <ComboboxContent>
        <ComboboxItem v-for="l in languages" :key="l.value" :value="l.value" :label="l.label">
          <ComboboxItemIndicator :value="l.value">✓</ComboboxItemIndicator>
          <ComboboxItemText>{{ l.label }}</ComboboxItemText>
        </ComboboxItem>
      </ComboboxContent>
    </ComboboxPortal>
  </ComboboxRoot>
</template>

<script setup lang="ts">
const selected = ref<string[]>([])
const languages = [
  { value: 'ts', label: 'TypeScript' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
]
</script>
```

### TagsInput

```vue
<template>
  <TagsInputRoot :value="tags" :on-value-change="(v) => tags = v">
    <TagsInputTag v-for="tag in tags" :key="tag" :value="tag">
      {{ tag }}
      <TagsInputTagDelete :value="tag">×</TagsInputTagDelete>
    </TagsInputTag>
    <TagsInputInput placeholder="Add tag…" />
  </TagsInputRoot>
</template>

<script setup lang="ts">
const tags = ref(['TypeScript', 'Nuxt'])
</script>
```

### HoverCard

```vue
<template>
  <HoverCardRoot>
    <HoverCardTrigger :as-child="true">
      <a href="#">@forge-ui</a>
    </HoverCardTrigger>
    <HoverCardPortal>
      <HoverCardContent>
        <p>Headless UI primitives — accessible, unstyled.</p>
      </HoverCardContent>
    </HoverCardPortal>
  </HoverCardRoot>
</template>
```

---

## Auto-imported components reference

### Accordion
`AccordionRoot` · `AccordionItem` · `AccordionHeader` · `AccordionTrigger` · `AccordionContent`

### AlertDialog
`AlertDialogRoot` · `AlertDialogTrigger` · `AlertDialogPortal` · `AlertDialogOverlay` · `AlertDialogContent` · `AlertDialogTitle` · `AlertDialogDescription` · `AlertDialogCancel` · `AlertDialogAction`

### Checkbox
`CheckboxRoot` · `CheckboxControl` · `CheckboxIndicator` · `CheckboxLabel` · `CheckboxGroup` · `CheckboxGroupAll`

### Collapsible
`CollapsibleRoot` · `CollapsibleTrigger` · `CollapsibleContent`

### Combobox
`ComboboxRoot` · `ComboboxLabel` · `ComboboxInput` · `ComboboxTrigger` · `ComboboxClearTrigger` · `ComboboxPortal` · `ComboboxContent` · `ComboboxItem` · `ComboboxItemText` · `ComboboxItemIndicator` · `ComboboxGroup` · `ComboboxGroupLabel` · `ComboboxCreateOption` · `ComboboxTagsInput` · `ComboboxTag` · `ComboboxTagDelete`

### DateField
`DateFieldRoot` · `DateFieldGroup` · `DateFieldMonthSegment` · `DateFieldDaySegment` · `DateFieldYearSegment` · `DateFieldSeparator` · `DateFieldHiddenInput`

### DatePicker
`DatePickerRoot` · `DatePickerTrigger` · `DatePickerContent` · `DatePickerCalendarHeader` · `DatePickerViewSwitchButton` · `DatePickerPrevMonthButton` · `DatePickerNextMonthButton` · `DatePickerPrevYearRangeButton` · `DatePickerNextYearRangeButton` · `DatePickerCalendarGrid` · `DatePickerCalendarRow` · `DatePickerWeekdayHeader` · `DatePickerCalendarCell` · `DatePickerMonthGrid` · `DatePickerMonthCell` · `DatePickerYearGrid` · `DatePickerYearCell` · `DatePickerPreset` · `DatePickerHiddenInput`

### DateRangePicker
`DateRangePickerRoot` · `DateRangePickerTrigger` · `DateRangePickerContent` · `DateRangePickerCalendarHeader` · `DateRangePickerPrevMonthButton` · `DateRangePickerNextMonthButton` · `DateRangePickerCalendarGrid` · `DateRangePickerCalendarRow` · `DateRangePickerWeekdayHeader` · `DateRangePickerCalendarCell` · `DateRangePickerClearButton` · `DateRangePickerPreset` · `DateRangePickerHiddenInputs`

### Dialog
`DialogRoot` · `DialogTrigger` · `DialogPortal` · `DialogOverlay` · `DialogContent` · `DialogTitle` · `DialogDescription` · `DialogClose`

### Field
`FieldRoot` · `FieldLabel` · `FieldRequiredIndicator` · `FieldControl` · `FieldDescription` · `FieldError` · `FieldGroup` · `FieldGroupLabel`

### HoverCard
`HoverCardRoot` · `HoverCardTrigger` · `HoverCardPortal` · `HoverCardContent` · `HoverCardArrow`

### NumberInput
`NumberInputRoot` · `NumberInputLabel` · `NumberInputControl` · `NumberInputInput` · `NumberInputIncrementTrigger` · `NumberInputDecrementTrigger` · `NumberInputHiddenInput`

### Popover
`PopoverRoot` · `PopoverTrigger` · `PopoverAnchor` · `PopoverPortal` · `PopoverContent` · `PopoverArrow` · `PopoverClose` · `PopoverTitle` · `PopoverDescription`

### Progress
`ProgressRoot` · `ProgressTrack` · `ProgressFill` · `ProgressLabel` · `ProgressValueText`

### RadioGroup
`RadioGroupRoot` · `RadioGroupItem` · `RadioGroupRadio` · `RadioGroupLabel` · `RadioGroupHiddenInput`

### Select
`SelectRoot` · `SelectLabel` · `SelectTrigger` · `SelectValue` · `SelectPlaceholder` · `SelectIndicator` · `SelectPortal` · `SelectContent` · `SelectItem` · `SelectItemText` · `SelectItemIndicator` · `SelectSeparator` · `SelectGroup` · `SelectGroupLabel`

### Separator
`SeparatorRoot`

### Slider
`SliderRoot` · `SliderTrack` · `SliderRange` · `SliderThumb` · `SliderHiddenInput` · `SliderMarkerGroup` · `SliderMarker`

### Switch
`SwitchRoot` · `SwitchControl` · `SwitchThumb` · `SwitchLabel`

### Tabs
`TabsRoot` · `TabsList` · `TabsTrigger` · `TabsPanel`

### TagsInput
`TagsInputRoot` · `TagsInputLabel` · `TagsInputInput` · `TagsInputTag` · `TagsInputTagDelete` · `TagsInputHiddenInput`

### TimePicker
`TimePickerRoot` · `TimePickerGroup` · `TimePickerHoursSegment` · `TimePickerMinutesSegment` · `TimePickerSecondsSegment` · `TimePickerPeriodSegment` · `TimePickerSeparator` · `TimePickerHiddenInput`

### Toggle
`ToggleRoot`

### ToggleGroup
`ToggleGroupRoot` · `ToggleGroupItem`

### Tooltip
`TooltipProvider` · `TooltipRoot` · `TooltipTrigger` · `TooltipAnchor` · `TooltipPortal` · `TooltipContent` · `TooltipArrow`

### VisuallyHidden
`VisuallyHiddenRoot`

---

## Auto-imported composables reference

| Composable | Description |
|---|---|
| `useDialog` | Dialog open/close state + prop getters |
| `useAlertDialog` | Alert dialog (Escape/outside-click blocked) |
| `usePopover` | Popover floating state |
| `useSelect` | Select state + keyboard navigation |
| `useCombobox` | Combobox state + filter + creatable |
| `useCheckbox` | Single checkbox state (checked / indeterminate) |
| `useSwitch` | Switch on/off state |
| `useTooltip` | Tooltip delay + state |
| `useHoverCard` | Hover card delay + state |
| `useTagsInput` | Tags input state + keyboard handling |
| `useSlider` | Slider drag + keyboard state |
| `useAccordion` | Accordion open state |
| `useCollapsible` | Collapsible open/close state |
| `useTabs` | Tabs active value + keyboard navigation |
| `useRadioGroup` | Radio group selection + keyboard navigation |
| `useNumberInput` | Number input spin + step + clamping |
| `useField` | Field ID provider (links label → input) |
| `useDateField` | Date field segment state |
| `useDateFieldControlled` | Controlled date field |
| `useTimePicker` | Time picker segment state |
| `useDatePicker` | Date picker calendar state |
| `useDatePickerControlled` | Controlled date picker |
| `useDateRangePicker` | Date range picker state |
| `useDateRangePickerControlled` | Controlled date range picker |
| `useToggle` | Toggle on/off state |
| `useToggleGroup` | Toggle group state |
| `usePresence` | Delays DOM removal until CSS transition ends |
| `useMachine` | Low-level machine binding (advanced) |

---

## TypeScript

All components and composables are fully typed. No additional setup needed.

```ts
// Types are available automatically — no separate @types package
const dialog = useDialog() // typed as UseDialogReturn
```

---

## Peer dependencies

- `nuxt >= 4.0.0`
- `@forge-ui/vue` (installed automatically as a transitive dependency)
