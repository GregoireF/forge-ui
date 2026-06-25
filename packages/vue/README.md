# @forge-ui/vue

Vue 3.5+ bindings for forge-ui headless UI primitives. All 22 primitives — WAI-ARIA compliant, zero styles.

## Install

```bash
npm install @forge-ui/vue
```

**Peer dependency**: `vue >= 3.5.0`

For Nuxt, use [`@forge-ui/nuxt`](../nuxt) — auto-imports all components and composables.

---

## Usage patterns

### Namespace import (recommended)

```vue
<script setup>
import { Dialog } from '@forge-ui/vue'
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

### Named imports

```vue
<script setup>
import { DialogRoot, DialogTrigger, DialogPortal, DialogOverlay, DialogContent, DialogTitle, DialogClose } from '@forge-ui/vue'
</script>
```

### Composable (hook API)

```vue
<script setup>
import { useDialog, DialogPortal } from '@forge-ui/vue'

const dialog = useDialog()
</script>

<template>
  <button v-bind="dialog.getTriggerProps()">Open</button>
  <template v-if="dialog.isOpen.value">
    <DialogPortal>
      <div v-bind="dialog.getContentProps()">
        <h2 v-bind="dialog.getTitleProps()">Title</h2>
        <button v-bind="dialog.getCloseProps()">Close</button>
      </div>
    </DialogPortal>
  </template>
</template>
```

> `isOpen` is a `ComputedRef<boolean>` — always use `.value` in templates when destructured.

---

## Primitives

### Dialog

```vue
<script setup>
import { ref } from 'vue'
import { Dialog } from '@forge-ui/vue'

const open = ref(false)
</script>

<template>
  <!-- v-model:open for two-way binding -->
  <Dialog.Root v-model:open="open">
    <Dialog.Trigger>Open</Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay />
      <Dialog.Content>
        <Dialog.Title>Title</Dialog.Title>
        <Dialog.Description>Description.</Dialog.Description>
        <Dialog.Close>Close</Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
</template>
```

| Prop (`Root`) | Type | Default |
|---|---|---|
| `open` / `v-model:open` | `boolean` | — |
| `onOpenChange` | `(open: boolean) => void` | — |
| `modal` | `boolean` | `true` |
| `id` | `string` | auto |

`Content` and `Overlay` accept `:forceMount="true"`. `Trigger` and `Close` accept `:asChild="true"`.

---

### Alert Dialog

```vue
<template>
  <AlertDialog.Root>
    <AlertDialog.Trigger>Delete</AlertDialog.Trigger>
    <AlertDialog.Portal>
      <AlertDialog.Overlay />
      <AlertDialog.Content>
        <AlertDialog.Title>Are you sure?</AlertDialog.Title>
        <AlertDialog.Description>This cannot be undone.</AlertDialog.Description>
        <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
        <AlertDialog.Action>Delete</AlertDialog.Action>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  </AlertDialog.Root>
</template>
```

---

### Popover

```vue
<template>
  <Popover.Root>
    <Popover.Trigger>Open popover</Popover.Trigger>
    <Popover.Portal>
      <Popover.Content>
        <Popover.Title>Title</Popover.Title>
        <Popover.Description>Content.</Popover.Description>
        <Popover.Close>Close</Popover.Close>
        <Popover.Arrow />
      </Popover.Content>
    </Popover.Portal>
  </Popover.Root>
</template>
```

---

### Tooltip

```vue
<template>
  <Tooltip.Provider :open-delay="700" :close-delay="300">
    <Tooltip.Root>
      <Tooltip.Trigger>Hover me</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content>
          Tooltip text
          <Tooltip.Arrow />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  </Tooltip.Provider>
</template>
```

---

### Hover Card

```vue
<template>
  <HoverCard.Root :open-delay="500" :close-delay="200">
    <HoverCard.Trigger>@username</HoverCard.Trigger>
    <HoverCard.Portal>
      <HoverCard.Content>
        Profile preview
        <HoverCard.Arrow />
      </HoverCard.Content>
    </HoverCard.Portal>
  </HoverCard.Root>
</template>
```

---

### Select

WAI-ARIA 1.2 Select-Only Combobox. Supports groups, separators, multi-select, virtual scroll.

```vue
<script setup>
import { ref } from 'vue'
import { Select } from '@forge-ui/vue'

const value = ref('')
</script>

<template>
  <Select.Root v-model:value="value">
    <Select.Label>Framework</Select.Label>
    <Select.Trigger>
      <Select.Value placeholder="Pick one…" />
      <Select.Indicator>▾</Select.Indicator>
    </Select.Trigger>
    <Select.Portal>
      <Select.Content>
        <Select.Group>
          <Select.GroupLabel>Frontend</Select.GroupLabel>
          <Select.Item value="react">
            <Select.ItemText>React</Select.ItemText>
            <Select.ItemIndicator>✓</Select.ItemIndicator>
          </Select.Item>
          <Select.Item value="vue">
            <Select.ItemText>Vue</Select.ItemText>
            <Select.ItemIndicator>✓</Select.ItemIndicator>
          </Select.Item>
        </Select.Group>
        <Select.Separator />
        <Select.Item value="angular" disabled>
          <Select.ItemText>Angular</Select.ItemText>
        </Select.Item>
      </Select.Content>
    </Select.Portal>
  </Select.Root>
</template>
```

**Virtual scroll**:

```vue
<Select.Root
  :all-options="thousandsOfOptions"
  :on-highlighted-scroll="(value, index) => virtualizerRef.scrollToIndex(index)"
>
  ...
</Select.Root>
```

---

### Combobox

```vue
<script setup>
import { ref } from 'vue'
import { Combobox } from '@forge-ui/vue'

const options = [
  { value: 'ts', label: 'TypeScript' },
  { value: 'js', label: 'JavaScript' },
]
</script>

<template>
  <!-- Single — client-side filter -->
  <Combobox.Root @update:value="console.log($event)">
    <Combobox.Label>Language</Combobox.Label>
    <Combobox.Input placeholder="Search…" />
    <Combobox.Trigger>▾</Combobox.Trigger>
    <Combobox.ClearTrigger>✕</Combobox.ClearTrigger>
    <Combobox.Portal>
      <Combobox.Content>
        <Combobox.Item
          v-for="o in options"
          :key="o.value"
          :value="o.value"
          :label="o.label"
        >
          <Combobox.ItemIndicator :value="o.value">✓ </Combobox.ItemIndicator>
          <Combobox.ItemText>{{ o.label }}</Combobox.ItemText>
        </Combobox.Item>
      </Combobox.Content>
    </Combobox.Portal>
  </Combobox.Root>

  <!-- Multi-select with TagsInput -->
  <Combobox.Root :multiple="true">
    <Combobox.Label>Frameworks</Combobox.Label>
    <Combobox.TagsInput>
      <Combobox.Tag
        v-for="o in options"
        :key="o.value"
        :value="o.value"
      >
        {{ o.label }}
        <Combobox.TagDelete :value="o.value">✕</Combobox.TagDelete>
      </Combobox.Tag>
    </Combobox.TagsInput>
    <Combobox.Input placeholder="Search…" />
    <Combobox.Portal>
      <Combobox.Content>
        <Combobox.Item
          v-for="o in options"
          :key="o.value"
          :value="o.value"
          :label="o.label"
        >
          <Combobox.ItemIndicator :value="o.value">✓ </Combobox.ItemIndicator>
          <Combobox.ItemText>{{ o.label }}</Combobox.ItemText>
        </Combobox.Item>
      </Combobox.Content>
    </Combobox.Portal>
  </Combobox.Root>

  <!-- Async -->
  <Combobox.Root :on-input-change="(q) => fetchAndSetOptions(q)">
    ...
  </Combobox.Root>

  <!-- Creatable -->
  <Combobox.Root :on-create-option="(v) => addOption(v)">
    <Combobox.Portal>
      <Combobox.Content>
        <Combobox.Item v-for="o in options" :key="o.value" :value="o.value" :label="o.label">...</Combobox.Item>
        <Combobox.CreateOption>Create "{{ inputValue }}"</Combobox.CreateOption>
      </Combobox.Content>
    </Combobox.Portal>
  </Combobox.Root>
</template>
```

---

### Checkbox

```vue
<template>
  <Checkbox.Root default-checked @update:checked="console.log($event)">
    <Checkbox.Control>
      <Checkbox.Indicator>✓</Checkbox.Indicator>
    </Checkbox.Control>
    <Checkbox.Label>Accept terms</Checkbox.Label>
    <Checkbox.HiddenInput name="terms" />
  </Checkbox.Root>

  <!-- Checkbox Group -->
  <Checkbox.Group :default-value="['a']" @update:value="setVals">
    <Checkbox.GroupAll>All</Checkbox.GroupAll>
    <Checkbox.Root value="a">
      <Checkbox.Control><Checkbox.Indicator>✓</Checkbox.Indicator></Checkbox.Control>
      <Checkbox.Label>Option A</Checkbox.Label>
    </Checkbox.Root>
    <Checkbox.Root value="b">
      <Checkbox.Control><Checkbox.Indicator>✓</Checkbox.Indicator></Checkbox.Control>
      <Checkbox.Label>Option B</Checkbox.Label>
    </Checkbox.Root>
  </Checkbox.Group>
</template>
```

---

### Radio Group

```vue
<template>
  <RadioGroup.Root default-value="react" @update:value="setVal">
    <RadioGroup.Label>Framework</RadioGroup.Label>
    <RadioGroup.Item value="react">
      <RadioGroup.Radio />
      <RadioGroup.Label>React</RadioGroup.Label>
      <RadioGroup.HiddenInput />
    </RadioGroup.Item>
    <RadioGroup.Item value="vue">
      <RadioGroup.Radio />
      <RadioGroup.Label>Vue</RadioGroup.Label>
      <RadioGroup.HiddenInput />
    </RadioGroup.Item>
  </RadioGroup.Root>
</template>
```

---

### Switch

```vue
<template>
  <Switch.Root default-checked @update:checked="setOn">
    <Switch.Control>
      <Switch.Thumb />
    </Switch.Control>
    <Switch.Label>Dark mode</Switch.Label>
    <Switch.HiddenInput name="dark-mode" />
  </Switch.Root>
</template>
```

---

### Slider

```vue
<script setup>
const marks = [{ value: 0 }, { value: 50, label: '50%' }, { value: 100 }]
</script>

<template>
  <!-- Single thumb -->
  <Slider.Root :default-value="50" :min="0" :max="100" :step="1" @update:value="setVal">
    <Slider.Track><Slider.Range /></Slider.Track>
    <Slider.Thumb aria-label="Value" />
    <Slider.HiddenInput name="volume" />
  </Slider.Root>

  <!-- Range (2 thumbs) -->
  <Slider.Root :value="[20, 80]" @update:value="setRange">
    <Slider.Track><Slider.Range /></Slider.Track>
    <Slider.Thumb :index="0" aria-label="Min" />
    <Slider.Thumb :index="1" aria-label="Max" />
  </Slider.Root>

  <!-- With decorative marks -->
  <Slider.Root :value="val" :marks="marks" :step="25">
    <Slider.Track><Slider.Range /></Slider.Track>
    <Slider.Thumb aria-label="Value" />
    <Slider.MarkerGroup>
      <Slider.Marker v-for="m in marks" :key="m.value" :value="m.value">
        {{ m.label }}
      </Slider.Marker>
    </Slider.MarkerGroup>
  </Slider.Root>

  <!-- Vertical -->
  <Slider.Root :value="val" orientation="vertical">
    <Slider.Track><Slider.Range /></Slider.Track>
    <Slider.Thumb aria-label="Value" />
  </Slider.Root>
</template>
```

---

### Number Input

```vue
<template>
  <NumberInput.Root :default-value="0" :min="0" :max="100" @update:value="setVal">
    <NumberInput.Label>Quantity</NumberInput.Label>
    <NumberInput.DecrementTrigger>−</NumberInput.DecrementTrigger>
    <NumberInput.Input aria-label="Quantity" />
    <NumberInput.IncrementTrigger>+</NumberInput.IncrementTrigger>
    <NumberInput.HiddenInput name="qty" />
  </NumberInput.Root>
</template>
```

---

### Tags Input

```vue
<template>
  <TagsInput.Root :default-value="['react']" @update:value="setTags">
    <TagsInput.Label>Technologies</TagsInput.Label>
    <TagsInput.Tag v-for="t in tags" :key="t" :value="t">
      {{ t }}
      <TagsInput.TagDelete :value="t">✕</TagsInput.TagDelete>
    </TagsInput.Tag>
    <TagsInput.Input placeholder="Add tag…" />
    <TagsInput.HiddenInput name="tags" />
  </TagsInput.Root>
</template>
```

---

### Field

```vue
<template>
  <Field.Root :required="true" :invalid="hasError">
    <Field.Label>Email</Field.Label>
    <Field.Control :asChild="true">
      <input type="email" v-model="email" />
    </Field.Control>
    <Field.Description>We'll never share your email.</Field.Description>
    <Field.Error>{{ errorMessage }}</Field.Error>
  </Field.Root>
</template>
```

---

### Accordion

```vue
<template>
  <Accordion.Root type="single" default-value="item-1">
    <Accordion.Item value="item-1">
      <Accordion.Header>
        <Accordion.Trigger>Section 1</Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content>Content 1</Accordion.Content>
    </Accordion.Item>
    <Accordion.Item value="item-2">
      <Accordion.Header>
        <Accordion.Trigger>Section 2</Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content>Content 2</Accordion.Content>
    </Accordion.Item>
  </Accordion.Root>
</template>
```

---

### Collapsible

```vue
<template>
  <Collapsible.Root>
    <Collapsible.Trigger>Toggle</Collapsible.Trigger>
    <Collapsible.Content>Hidden content</Collapsible.Content>
  </Collapsible.Root>
</template>
```

---

### Tabs

```vue
<template>
  <Tabs.Root default-value="tab1">
    <Tabs.List aria-label="Navigation">
      <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
      <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
    </Tabs.List>
    <Tabs.Panel value="tab1">Panel 1</Tabs.Panel>
    <Tabs.Panel value="tab2">Panel 2</Tabs.Panel>
  </Tabs.Root>
</template>
```

---

### Progress

```vue
<template>
  <!-- Determinate -->
  <Progress.Root :value="65" :max="100">
    <Progress.Label>Loading…</Progress.Label>
    <Progress.Track><Progress.Fill /></Progress.Track>
    <Progress.ValueText />
  </Progress.Root>

  <!-- Indeterminate -->
  <Progress.Root :value="null">
    <Progress.Track><Progress.Fill /></Progress.Track>
  </Progress.Root>
</template>
```

---

### Date Field

```vue
<template>
  <DateField.Root @update:value="setDate">
    <DateField.Group>
      <DateField.MonthSegment />
      <DateField.Separator>/</DateField.Separator>
      <DateField.DaySegment />
      <DateField.Separator>/</DateField.Separator>
      <DateField.YearSegment />
    </DateField.Group>
    <DateField.HiddenInput name="date" />
  </DateField.Root>
</template>
```

---

### Time Picker

```vue
<template>
  <TimePicker.Root :hour-cycle="12" :show-seconds="true" @update:value="setTime">
    <TimePicker.Group>
      <TimePicker.HoursSegment />
      <TimePicker.Separator>:</TimePicker.Separator>
      <TimePicker.MinutesSegment />
      <TimePicker.Separator>:</TimePicker.Separator>
      <TimePicker.SecondsSegment />
      <TimePicker.PeriodSegment />
    </TimePicker.Group>
    <TimePicker.HiddenInput name="time" />
  </TimePicker.Root>
</template>
```

---

### Date Picker

```vue
<template>
  <DatePicker.Root
    :min="{ year: 2024, month: 1, day: 1 }"
    :max="{ year: 2025, month: 12, day: 31 }"
    @update:value="setDate"
  >
    <DatePicker.Trigger>Pick a date</DatePicker.Trigger>
    <DatePicker.Portal>
      <DatePicker.Content :force-mount="true">
        <div style="display:flex;justify-content:space-between">
          <DatePicker.PrevMonthButton>←</DatePicker.PrevMonthButton>
          <DatePicker.CalendarHeader />
          <DatePicker.NextMonthButton>→</DatePicker.NextMonthButton>
        </div>
        <DatePicker.CalendarGrid>
          <DatePicker.CalendarRow :week-index="-1">
            <DatePicker.WeekdayHeader v-for="i in 7" :key="i" :day-index="i - 1" />
          </DatePicker.CalendarRow>
        </DatePicker.CalendarGrid>
      </DatePicker.Content>
    </DatePicker.Portal>
    <DatePicker.HiddenInput name="date" />
  </DatePicker.Root>
</template>
```

---

### Date Range Picker

```vue
<template>
  <DateRangePicker.Root @update:value="setRange">
    <DateRangePicker.Trigger>Pick range</DateRangePicker.Trigger>
    <DateRangePicker.Portal>
      <DateRangePicker.Content>
        <DateRangePicker.PrevMonthButton>←</DateRangePicker.PrevMonthButton>
        <DateRangePicker.CalendarHeader />
        <DateRangePicker.NextMonthButton>→</DateRangePicker.NextMonthButton>
        <DateRangePicker.CalendarGrid>
          <DateRangePicker.CalendarRow :week-index="-1">
            <DateRangePicker.WeekdayHeader v-for="i in 7" :key="i" :day-index="i - 1" />
          </DateRangePicker.CalendarRow>
        </DateRangePicker.CalendarGrid>
        <DateRangePicker.ClearButton>Clear</DateRangePicker.ClearButton>
      </DateRangePicker.Content>
    </DateRangePicker.Portal>
    <DateRangePicker.HiddenInputs name="range" />
  </DateRangePicker.Root>
</template>
```

---

## Data attributes

| Attribute | Values | Elements |
|---|---|---|
| `data-state` | `"open"` / `"closed"` / `"checked"` / `"unchecked"` | All stateful elements |
| `data-forge-scope` | `"dialog"` / `"select"` / `"slider"` / … | All |
| `data-forge-part` | `"trigger"` / `"content"` / `"item"` / `"thumb"` / … | All |
| `data-disabled` | `""` | Disabled elements |
| `data-selected` | `""` | Selected options |
| `data-highlighted` | `""` | Keyboard-focused option |
| `data-in-range` | `""` | Slider marks within the current range |
| `data-orientation` | `"horizontal"` / `"vertical"` | Slider, Tabs |
| `data-side` | `"top"` / `"bottom"` / `"left"` / `"right"` | Popover, Select, Tooltip |
