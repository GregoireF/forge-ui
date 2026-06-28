# @forge-ui/time-picker

Framework-agnostic Time Picker machine and connect function. WAI-ARIA [Spinbutton Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/). Segmented time input — hours / minutes / seconds / AM-PM. Supports 12-hour and 24-hour cycles, configurable step.

> Consumed by `@forge-ui/react` and `@forge-ui/vue`.

## Install

```bash
npm install @forge-ui/time-picker
```

## API

### `createTimePickerMachine(options)`

```ts
import { createTimePickerMachine } from '@forge-ui/time-picker'

const machine = createTimePickerMachine({
  id: 'meeting-time',
  hourCycle: 12,
  showSeconds: false,
  minuteStep: 15,
  locale: 'en-US',
  onValueChange: (time) => console.log(time), // TimeValue | null
})

machine.start()
machine.send({ type: 'FOCUS_SEGMENT', segment: 'hours' })
machine.send({ type: 'TYPE_DIGIT', digit: '9' })
machine.stop()
```

#### Options

| Option | Type | Default |
|---|---|---|
| `id` | `string` | required |
| `value` | `TimeValue \| null` | — |
| `defaultValue` | `TimeValue \| null` | — |
| `hourCycle` | `12 \| 24` | `24` |
| `showSeconds` | `boolean` | `false` |
| `minuteStep` | `number` | `1` |
| `secondStep` | `number` | `1` |
| `locale` | `string` | `"en-US"` |
| `disabled` | `boolean` | `false` |
| `readOnly` | `boolean` | `false` |
| `onValueChange` | `(time: TimeValue \| null) => void` | — |

```ts
interface TimeValue {
  hours: number    // 0–23 internally (regardless of hourCycle)
  minutes: number  // 0–59
  seconds: number  // 0–59
}
```

### Events

| Event | Payload | Description |
|---|---|---|
| `FOCUS_SEGMENT` | `{ segment: string }` | Focus hours / minutes / seconds / period |
| `BLUR_SEGMENT` | — | Blur active segment |
| `TYPE_DIGIT` | `{ digit: string }` | Numeric key input |
| `INCREMENT` | — | ArrowUp — increment active segment |
| `DECREMENT` | — | ArrowDown — decrement active segment |
| `TOGGLE_PERIOD` | — | Switch AM/PM (12h mode) |
| `CLEAR_SEGMENT` | — | Delete / Backspace |
| `NEXT_SEGMENT` | — | Tab / ArrowRight |
| `PREV_SEGMENT` | — | Shift+Tab / ArrowLeft |
| `SET_VALUE` | `{ value: TimeValue }` | Set time programmatically |

### `connectTimePicker(snapshot, send, machine)`

```ts
const api = connectTimePicker(machine.getSnapshot(), machine.send, machine)

api.assembledTime   // TimeValue | null  complete time (null until all segments filled)
api.isoValue        // string            ISO string (e.g. "09:30:00") or ""
api.period          // "AM" | "PM" | null  (null in 24h mode)
api.focusedSegment  // "hours" | "minutes" | "seconds" | "period" | null
api.displayValues   // { hours: string; minutes: string; seconds: string; period: string }

api.getGroupProps()            // segments container
api.getHoursSegmentProps()     // role="spinbutton", 1–12 or 0–23
api.getMinutesSegmentProps()   // role="spinbutton", 0–59 (step: minuteStep)
api.getSecondsSegmentProps()   // role="spinbutton", 0–59 (step: secondStep) — shown when showSeconds
api.getPeriodSegmentProps()    // AM/PM toggle — role="spinbutton", values: AM/PM — 12h mode only
api.getSeparatorProps()        // ":" literal separator
api.getHiddenInputProps()      // hidden <input type="hidden"> with ISO value for forms
```

## States

Tracks `focusedSegment` and digit buffers per segment.

## Segment behavior

- `minuteStep: 15` → ArrowUp/Down cycles through 0, 15, 30, 45
- Period segment: `a`/`p` keys switch AM/PM; ArrowUp/Down toggles
- Hours in 12h mode: display is 1–12; stored internally as 0–23
- Auto-advance: typing `1` then `2` in hours (24h) → 12, then auto-advances to minutes

## Data attributes

| Attribute | Values | Elements |
|---|---|---|
| `data-forge-scope` | `"time-picker"` | all |
| `data-forge-part` | `"group"` / `"hours-segment"` / `"minutes-segment"` / `"seconds-segment"` / `"period-segment"` / `"separator"` | |
| `data-focused` | `""` | active segment |
| `data-disabled` | `""` | disabled state |
| `data-readonly` | `""` | read-only state |

## WAI-ARIA

Each segment: `role="spinbutton"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-valuetext`, `aria-label` (e.g. "Hours", "AM/PM"). Period segment uses `aria-valuetext` of `"AM"` or `"PM"`.
