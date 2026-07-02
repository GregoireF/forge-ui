# @forge-ui/react

[![CI](https://github.com/GregoireF/forge-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/GregoireF/forge-ui/actions/workflows/ci.yml)
[![WAI-ARIA 1.2](https://img.shields.io/badge/WAI--ARIA-1.2-0057b8)](https://www.w3.org/TR/wai-aria-1.2/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)

React 19+ bindings for forge-ui headless UI primitives. All 28 primitives — WAI-ARIA compliant, zero styles.

Part of [forge-ui](../../README.md) — see the root README for the full primitive list, architecture overview, and competitor comparison.

## Install

```bash
npm install @forge-ui/react
```

**Peer dependencies**: `react >= 19.0.0`, `react-dom >= 19.0.0`

---

## Primitives

### Dialog

```tsx
import { Dialog } from '@forge-ui/react'

<Dialog.Root>
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
```

| Prop (`Root`) | Type | Default |
|---|---|---|
| `open` | `boolean` | — |
| `onOpenChange` | `(open: boolean) => void` | — |
| `modal` | `boolean` | `true` |
| `id` | `string` | auto |

`Content` and `Overlay` accept `forceMount` for CSS exit animations. `Trigger` and `Close` accept `asChild`.

---

### Alert Dialog

Non-dismissible variant — Escape and outside clicks do not close.

```tsx
import { AlertDialog } from '@forge-ui/react'

<AlertDialog.Root>
  <AlertDialog.Trigger>Delete</AlertDialog.Trigger>
  <AlertDialog.Portal>
    <AlertDialog.Overlay />
    <AlertDialog.Content>
      <AlertDialog.Title>Are you sure?</AlertDialog.Title>
      <AlertDialog.Description>This action cannot be undone.</AlertDialog.Description>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action>Delete</AlertDialog.Action>
    </AlertDialog.Content>
  </AlertDialog.Portal>
</AlertDialog.Root>
```

---

### Popover

```tsx
import { Popover } from '@forge-ui/react'

<Popover.Root>
  <Popover.Trigger>Open popover</Popover.Trigger>
  <Popover.Anchor /> {/* optional separate anchor */}
  <Popover.Portal>
    <Popover.Content>
      <Popover.Title>Title</Popover.Title>
      <Popover.Description>Content.</Popover.Description>
      <Popover.Close>Close</Popover.Close>
      <Popover.Arrow />
    </Popover.Content>
  </Popover.Portal>
</Popover.Root>
```

| Prop (`Root`) | Type | Default |
|---|---|---|
| `positioning` | `FloatingPositioning` | `{ placement: 'bottom' }` |
| `modal` | `boolean` | `false` |

---

### Tooltip

```tsx
import { Tooltip } from '@forge-ui/react'

<Tooltip.Provider openDelay={700} closeDelay={300}>
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
```

`Provider` enables skip-delay: after one tooltip closes, the next opens without delay.

---

### Hover Card

```tsx
import { HoverCard } from '@forge-ui/react'

<HoverCard.Root openDelay={500} closeDelay={200}>
  <HoverCard.Trigger>@username</HoverCard.Trigger>
  <HoverCard.Portal>
    <HoverCard.Content>
      Profile preview
      <HoverCard.Arrow />
    </HoverCard.Content>
  </HoverCard.Portal>
</HoverCard.Root>
```

---

### Menu

`role="menu"` dropdown with keyboard navigation and submenus.

```tsx
import { Menu } from '@forge-ui/react'

<Menu.Root>
  <Menu.Trigger>Actions</Menu.Trigger>
  <Menu.Portal>
    <Menu.Content>
      <Menu.Item onSelect={() => console.log('edit')}>Edit</Menu.Item>
      <Menu.Item onSelect={() => console.log('duplicate')}>Duplicate</Menu.Item>
      <Menu.Separator />
      <Menu.Item onSelect={() => console.log('delete')} disabled>Delete</Menu.Item>
    </Menu.Content>
  </Menu.Portal>
</Menu.Root>
```

| Prop (`Root`) | Type | Default |
|---|---|---|
| `open` | `boolean` | — |
| `onOpenChange` | `(open: boolean) => void` | — |
| `positioning` | `FloatingPositioning` | `{ placement: 'bottom-start' }` |

---

### Select

WAI-ARIA 1.2 Select-Only Combobox. Supports groups, separators, multi-select, virtual scroll.

```tsx
import { Select } from '@forge-ui/react'

<Select.Root onValueChange={(v) => console.log(v)}>
  <Select.Label>Framework</Select.Label>
  <Select.Trigger>
    <Select.Value>
      <Select.Placeholder>Pick one…</Select.Placeholder>
    </Select.Value>
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
```

**Virtual scroll** — pass `allOptions` + `onHighlightedScroll` for virtualizer integration:

```tsx
<Select.Root
  allOptions={thousandsOfOptions}
  onHighlightedScroll={(value, index) => virtualizerRef.scrollToIndex(index)}
>
  ...
</Select.Root>
```

---

### Combobox

Filterable input. Supports async loading, multi-select, option creation, groups, virtual scroll, and TagsInput for multi-value display.

```tsx
import { Combobox } from '@forge-ui/react'

// Single — client-side filter
<Combobox.Root onValueChange={(v) => console.log(v)}>
  <Combobox.Label>Language</Combobox.Label>
  <Combobox.Input placeholder="Search…" />
  <Combobox.Trigger>▾</Combobox.Trigger>
  <Combobox.ClearTrigger>✕</Combobox.ClearTrigger>
  <Combobox.Portal>
    <Combobox.Content>
      {options.map(o => (
        <Combobox.Item key={o.value} value={o.value} label={o.label}>
          <Combobox.ItemIndicator value={o.value}>✓ </Combobox.ItemIndicator>
          <Combobox.ItemText>{o.label}</Combobox.ItemText>
        </Combobox.Item>
      ))}
    </Combobox.Content>
  </Combobox.Portal>
</Combobox.Root>

// Multi-select with TagsInput pills
<Combobox.Root multiple>
  <Combobox.Label>Frameworks</Combobox.Label>
  <Combobox.TagsInput>
    {options.map(o => (
      <Combobox.Tag key={o.value} value={o.value}>
        {o.label}
        <Combobox.TagDelete value={o.value}>✕</Combobox.TagDelete>
      </Combobox.Tag>
    ))}
  </Combobox.TagsInput>
  <Combobox.Input />
  <Combobox.Portal>
    <Combobox.Content>
      {options.map(o => (
        <Combobox.Item key={o.value} value={o.value} label={o.label}>
          <Combobox.ItemIndicator value={o.value}>✓ </Combobox.ItemIndicator>
          <Combobox.ItemText>{o.label}</Combobox.ItemText>
        </Combobox.Item>
      ))}
    </Combobox.Content>
  </Combobox.Portal>
</Combobox.Root>

// Async — server-side filter
<Combobox.Root onInputChange={async (q) => setOptions(await fetchOptions(q))}>
  ...
</Combobox.Root>

// Creatable
<Combobox.Root onCreateOption={(value) => addOption(value)}>
  <Combobox.Portal>
    <Combobox.Content>
      {options.map(o => <Combobox.Item key={o.value} value={o.value} label={o.label}>...</Combobox.Item>)}
      <Combobox.CreateOption>Create "{inputValue}"</Combobox.CreateOption>
    </Combobox.Content>
  </Combobox.Portal>
</Combobox.Root>
```

---

### Checkbox

Tri-state (`true` / `false` / `"indeterminate"`). Renders a visually hidden `<input type="checkbox">` for form submission.

```tsx
import { Checkbox } from '@forge-ui/react'

<Checkbox.Root defaultChecked onCheckedChange={(c) => console.log(c)}>
  <Checkbox.Control>
    <Checkbox.Indicator>✓</Checkbox.Indicator>
  </Checkbox.Control>
  <Checkbox.Label>Accept terms</Checkbox.Label>
  <Checkbox.HiddenInput name="terms" />
</Checkbox.Root>
```

**Checkbox Group** (select-all + partial):

```tsx
<Checkbox.Group defaultValue={['a']} onValueChange={setVals}>
  <Checkbox.GroupAll>All</Checkbox.GroupAll>
  <Checkbox.Root value="a"><Checkbox.Control><Checkbox.Indicator>✓</Checkbox.Indicator></Checkbox.Control><Checkbox.Label>A</Checkbox.Label></Checkbox.Root>
  <Checkbox.Root value="b"><Checkbox.Control><Checkbox.Indicator>✓</Checkbox.Indicator></Checkbox.Control><Checkbox.Label>B</Checkbox.Label></Checkbox.Root>
</Checkbox.Group>
```

---

### Radio Group

```tsx
import { RadioGroup } from '@forge-ui/react'

<RadioGroup.Root defaultValue="react" onValueChange={setVal}>
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
```

---

### Switch

```tsx
import { Switch } from '@forge-ui/react'

<Switch.Root defaultChecked onCheckedChange={setOn}>
  <Switch.Control>
    <Switch.Thumb />
  </Switch.Control>
  <Switch.Label>Dark mode</Switch.Label>
  <Switch.HiddenInput name="dark-mode" />
</Switch.Root>
```

---

### Toggle

Stateful button with `aria-pressed`. Single element — no compound children.

```tsx
import { Toggle } from '@forge-ui/react'

// Uncontrolled
<Toggle aria-label="Bold" defaultPressed={false}>
  <strong>B</strong>
</Toggle>

// Controlled
<Toggle pressed={isBold} onPressedChange={setIsBold} aria-label="Bold">
  <strong>B</strong>
</Toggle>
```

| Prop | Type | Default |
|---|---|---|
| `pressed` / `defaultPressed` | `boolean` | — / `false` |
| `onPressedChange` | `(pressed: boolean) => void` | — |
| `disabled` | `boolean` | `false` |
| `value` | `string` | — |

---

### Toggle Group

Group of toggle buttons — `role="toolbar"` with roving tabindex.

```tsx
import { ToggleGroup } from '@forge-ui/react'

// Single selection (text alignment)
<ToggleGroup.Root type="single" aria-label="Text alignment">
  <ToggleGroup.Item value="left" aria-label="Align left">←</ToggleGroup.Item>
  <ToggleGroup.Item value="center" aria-label="Center">↔</ToggleGroup.Item>
  <ToggleGroup.Item value="right" aria-label="Align right">→</ToggleGroup.Item>
</ToggleGroup.Root>

// Multiple selection (text formatting)
<ToggleGroup.Root type="multiple" aria-label="Text formatting" defaultValue={['bold']}>
  <ToggleGroup.Item value="bold" aria-label="Bold"><strong>B</strong></ToggleGroup.Item>
  <ToggleGroup.Item value="italic" aria-label="Italic"><em>I</em></ToggleGroup.Item>
  <ToggleGroup.Item value="underline" aria-label="Underline"><u>U</u></ToggleGroup.Item>
</ToggleGroup.Root>
```

| Prop (`Root`) | Type | Default |
|---|---|---|
| `type` | `"single" \| "multiple"` | `"single"` |
| `value` / `defaultValue` | `string[]` | — / `[]` |
| `onValueChange` | `(value: string[]) => void` | — |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` |
| `rovingFocus` / `loop` | `boolean` | `true` / `true` |

---

### Slider

Multi-thumb range slider. Supports marks, vertical orientation, and two callbacks.

```tsx
import { Slider } from '@forge-ui/react'

// Single thumb
<Slider.Root defaultValue={50} min={0} max={100} step={1} onValueChange={setVal}>
  <Slider.Track>
    <Slider.Range />
  </Slider.Track>
  <Slider.Thumb aria-label="Value" />
  <Slider.HiddenInput name="volume" />
</Slider.Root>

// Range (2 thumbs)
<Slider.Root value={[20, 80]} onValueChange={setRange}>
  <Slider.Track><Slider.Range /></Slider.Track>
  <Slider.Thumb index={0} aria-label="Min" />
  <Slider.Thumb index={1} aria-label="Max" />
</Slider.Root>

// With decorative marks
const marks = [{ value: 0 }, { value: 25 }, { value: 50, label: '50%' }, { value: 75 }, { value: 100 }]

<Slider.Root value={val} marks={marks} step={25}>
  <Slider.Track><Slider.Range /></Slider.Track>
  <Slider.Thumb aria-label="Value" />
  <Slider.MarkerGroup>
    {marks.map(m => (
      <Slider.Marker key={m.value} value={m.value}>{m.label}</Slider.Marker>
    ))}
  </Slider.MarkerGroup>
</Slider.Root>

// Vertical
<Slider.Root value={val} orientation="vertical">
  <Slider.Track><Slider.Range /></Slider.Track>
  <Slider.Thumb aria-label="Value" />
</Slider.Root>
```

| Prop (`Root`) | Type | Default |
|---|---|---|
| `value` / `defaultValue` | `number \| number[]` | — |
| `min` / `max` / `step` | `number` | `0` / `100` / `1` |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` |
| `marks` | `{ value: number; label?: string }[]` | — |
| `onValueChange` | `(values: number[]) => void` | — |
| `onValueCommit` | `(values: number[]) => void` | — |

---

### Number Input

```tsx
import { NumberInput } from '@forge-ui/react'

<NumberInput.Root defaultValue={0} min={0} max={100} step={1} onValueChange={setVal}>
  <NumberInput.Label>Quantity</NumberInput.Label>
  <NumberInput.DecrementTrigger>−</NumberInput.DecrementTrigger>
  <NumberInput.Input aria-label="Quantity" />
  <NumberInput.IncrementTrigger>+</NumberInput.IncrementTrigger>
  <NumberInput.HiddenInput name="qty" />
</NumberInput.Root>
```

Holds the spinner button for continuous increment/decrement. Locale-aware formatting.

---

### Tags Input

```tsx
import { TagsInput } from '@forge-ui/react'

<TagsInput.Root defaultValue={['react']} onValueChange={setTags}>
  <TagsInput.Label>Technologies</TagsInput.Label>
  {tags.map(t => (
    <TagsInput.Tag key={t} value={t}>
      {t}
      <TagsInput.TagDelete value={t}>✕</TagsInput.TagDelete>
    </TagsInput.Tag>
  ))}
  <TagsInput.Input placeholder="Add tag…" />
  <TagsInput.HiddenInput name="tags" />
</TagsInput.Root>
```

---

### Field

ID provider for accessible form fields. No visual output.

```tsx
import { Field } from '@forge-ui/react'

<Field.Root required invalid={hasError}>
  <Field.Label>Email</Field.Label>
  <Field.Control asChild>
    <input type="email" />
  </Field.Control>
  <Field.Description>We'll never share your email.</Field.Description>
  <Field.Error>{errorMessage}</Field.Error>
  <Field.RequiredIndicator>*</Field.RequiredIndicator>
</Field.Root>
```

---

### Accordion

```tsx
import { Accordion } from '@forge-ui/react'

// Single (one open at a time, non-collapsible by default)
<Accordion.Root type="single" defaultValue="item-1">
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

// Multiple
<Accordion.Root type="multiple">...</Accordion.Root>
```

---

### Collapsible

```tsx
import { Collapsible } from '@forge-ui/react'

<Collapsible.Root>
  <Collapsible.Trigger>Toggle</Collapsible.Trigger>
  <Collapsible.Content>Hidden content</Collapsible.Content>
</Collapsible.Root>
```

---

### Tabs

```tsx
import { Tabs } from '@forge-ui/react'

<Tabs.Root defaultValue="tab1">
  <Tabs.List aria-label="Navigation">
    <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
    <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Panel value="tab1">Panel 1</Tabs.Panel>
  <Tabs.Panel value="tab2">Panel 2</Tabs.Panel>
</Tabs.Root>
```

| Prop (`Root`) | Type | Default |
|---|---|---|
| `activationMode` | `"automatic" \| "manual"` | `"automatic"` |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` |

---

### Progress

```tsx
import { Progress } from '@forge-ui/react'

// Determinate
<Progress.Root value={65} min={0} max={100}>
  <Progress.Label>Loading…</Progress.Label>
  <Progress.Track>
    <Progress.Fill />
  </Progress.Track>
  <Progress.ValueText />
</Progress.Root>

// Indeterminate
<Progress.Root value={null}>
  <Progress.Track><Progress.Fill /></Progress.Track>
</Progress.Root>
```

---

### Date Field

Segmented spinbutton date input (day / month / year).

```tsx
import { DateField } from '@forge-ui/react'

<DateField.Root onValueChange={setDate}>
  <DateField.Group>
    <DateField.MonthSegment />
    <DateField.Separator>/</DateField.Separator>
    <DateField.DaySegment />
    <DateField.Separator>/</DateField.Separator>
    <DateField.YearSegment />
  </DateField.Group>
  <DateField.HiddenInput name="date" />
</DateField.Root>
```

---

### Time Picker

```tsx
import { TimePicker } from '@forge-ui/react'

<TimePicker.Root hourCycle={12} showSeconds onValueChange={setTime}>
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
```

---

### Date Picker

Calendar popup — day / month / year views, presets, min/max constraints, forceMount.

```tsx
import { DatePicker } from '@forge-ui/react'

<DatePicker.Root
  min={{ year: 2024, month: 1, day: 1 }}
  max={{ year: 2025, month: 12, day: 31 }}
  onValueChange={setDate}
>
  <DatePicker.Trigger>Pick a date</DatePicker.Trigger>
  <DatePicker.Portal>
    <DatePicker.Content forceMount>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <DatePicker.PrevMonthButton>←</DatePicker.PrevMonthButton>
        <DatePicker.CalendarHeader />
        <DatePicker.NextMonthButton>→</DatePicker.NextMonthButton>
      </div>
      <DatePicker.CalendarGrid>
        <DatePicker.CalendarRow weekIndex={-1}>
          {Array.from({ length: 7 }, (_, i) => (
            <DatePicker.WeekdayHeader key={i} dayIndex={i} />
          ))}
        </DatePicker.CalendarRow>
      </DatePicker.CalendarGrid>
    </DatePicker.Content>
  </DatePicker.Portal>
  <DatePicker.HiddenInput name="date" />
</DatePicker.Root>
```

---

### Date Range Picker

Two-phase range selection with visual hover preview.

```tsx
import { DateRangePicker } from '@forge-ui/react'

<DateRangePicker.Root onValueChange={({ start, end }) => setRange({ start, end })}>
  <DateRangePicker.Trigger>Pick range</DateRangePicker.Trigger>
  <DateRangePicker.Portal>
    <DateRangePicker.Content>
      <DateRangePicker.PrevMonthButton>←</DateRangePicker.PrevMonthButton>
      <DateRangePicker.CalendarHeader />
      <DateRangePicker.NextMonthButton>→</DateRangePicker.NextMonthButton>
      <DateRangePicker.CalendarGrid>
        <DateRangePicker.CalendarRow weekIndex={-1}>
          {Array.from({ length: 7 }, (_, i) => (
            <DateRangePicker.WeekdayHeader key={i} dayIndex={i} />
          ))}
        </DateRangePicker.CalendarRow>
      </DateRangePicker.CalendarGrid>
      <DateRangePicker.ClearButton>Clear</DateRangePicker.ClearButton>
    </DateRangePicker.Content>
  </DateRangePicker.Portal>
  <DateRangePicker.HiddenInputs name="range" />
</DateRangePicker.Root>
```

---

### Avatar

Image with accessible fallback. FSM-driven: tracks load status, computes initials from `name`.

```tsx
import { Avatar } from '@forge-ui/react'

<Avatar.Root name="Alice Smith" style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', position: 'relative' }}>
  <Avatar.Image src="https://example.com/photo.jpg" alt="Alice Smith" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  <Avatar.Fallback delayMs={600}>AS</Avatar.Fallback>
</Avatar.Root>
```

Use `useAvatarContext()` inside a child to read `initials` without duplicating the machine:

```tsx
import { Avatar, useAvatarContext } from '@forge-ui/react'

function InitialsFallback() {
  const { initials } = useAvatarContext()
  return <Avatar.Fallback delayMs={600}>{initials}</Avatar.Fallback>
}
```

| Prop (`Root`) | Type | Default |
|---|---|---|
| `name` | `string` | — |
| `onStatusChange` | `(status: "idle" \| "loading" \| "loaded" \| "error") => void` | — |

| Prop (`Fallback`) | Type | Default |
|---|---|---|
| `delayMs` | `number` | `0` |
| `forceMount` | `boolean` | `false` |

---

### Separator

Semantic or decorative divider — stateless, no machine.

```tsx
import { Separator } from '@forge-ui/react'

// Semantic (announced by screen readers)
<Separator />
<Separator orientation="vertical" />

// Decorative (aria-hidden, role="none")
<Separator decorative />
```

| Prop | Type | Default |
|---|---|---|
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` |
| `decorative` | `boolean` | `false` |

---

### Visually Hidden

Hides content visually while keeping it in the accessibility tree. Use for icon-button labels and skip links.

```tsx
import { VisuallyHidden } from '@forge-ui/react'

// Icon button with accessible label
<button aria-label={undefined}>
  <CloseIcon />
  <VisuallyHidden>Close dialog</VisuallyHidden>
</button>

// Skip link (focusable — reveals itself on focus via CSS)
<VisuallyHidden focusable>
  <a href="#main-content">Skip to content</a>
</VisuallyHidden>
```

| Prop | Type | Default |
|---|---|---|
| `focusable` | `boolean` | `false` |

---

## Shared patterns

### Controlled mode

Every primitive that manages open/value state accepts controlled props:

```tsx
const [open, setOpen] = useState(false)
<Dialog.Root open={open} onOpenChange={setOpen}>...</Dialog.Root>

const [value, setValue] = useState<string[]>([])
<Select.Root value={value} onValueChange={setValue}>...</Select.Root>
```

### `asChild` — polymorphic rendering

```tsx
<Dialog.Trigger asChild>
  <a href="#">Open dialog</a>
</Dialog.Trigger>

<Field.Control asChild>
  <input type="email" />
</Field.Control>
```

### `forceMount` — CSS exit animations

```tsx
<Dialog.Content forceMount>...</Dialog.Content>
<Popover.Content forceMount>...</Popover.Content>
<Select.Content forceMount>...</Select.Content>
<DatePicker.Content forceMount>...</DatePicker.Content>
```

```css
[data-forge-part="content"][data-state="open"]   { animation: fadeIn  150ms ease; }
[data-forge-part="content"][data-state="closed"] { animation: fadeOut 150ms ease forwards; }
```

### `useMachine` — low-level hook

Bind any forge-ui machine instance directly to React via `useSyncExternalStore`:

```tsx
import { useMachine } from '@forge-ui/react'
import { createDialogMachine, connectDialog } from '@forge-ui/dialog'

function MyDialog() {
  const machine = useMemo(() => createDialogMachine({ id: 'dlg' }), [])
  const [snapshot, send] = useMachine(machine)
  const api = connectDialog(snapshot, send, machine)

  return (
    <>
      <button {...api.getTriggerProps()}>Open</button>
      {api.isOpen && (
        <div {...api.getContentProps()}>
          <h2 {...api.getTitleProps()}>Title</h2>
          <button {...api.getCloseProps()}>Close</button>
        </div>
      )}
    </>
  )
}
```

---

## Data attributes

| Attribute | Values | Elements |
|---|---|---|
| `data-state` | `"open"` / `"closed"` / `"checked"` / `"unchecked"` / `"indeterminate"` | All stateful elements |
| `data-forge-scope` | `"dialog"` / `"select"` / `"slider"` / … | All |
| `data-forge-part` | `"trigger"` / `"content"` / `"item"` / `"thumb"` / … | All |
| `data-disabled` | `""` | Disabled elements |
| `data-selected` | `""` | Selected options |
| `data-highlighted` | `""` | Keyboard-focused option |
| `data-in-range` | `""` | Slider marks within the current range |
| `data-orientation` | `"horizontal"` / `"vertical"` | Slider, Tabs |
| `data-side` | `"top"` / `"bottom"` / `"left"` / `"right"` | Popover, Select, Tooltip |
