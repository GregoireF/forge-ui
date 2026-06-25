# @forge-ui/date-field

Framework-agnostic Date Field machine and connect function. WAI-ARIA [Spinbutton Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/). Segmented date input (month / day / year) — no calendar popup. Each segment is independently editable.

> Consumed by `@forge-ui/react` and `@forge-ui/vue`. For a calendar popup, use `@forge-ui/date-picker`.

## Install

```bash
npm install @forge-ui/date-field
```

## API

### `createDateFieldMachine(options)`

```ts
import { createDateFieldMachine } from '@forge-ui/date-field'

const machine = createDateFieldMachine({
  id: 'birthdate',
  locale: 'en-US',
  min: { year: 1900, month: 1, day: 1 },
  max: { year: 2100, month: 12, day: 31 },
  onValueChange: (date) => console.log(date), // CalendarDate | null
})

machine.start()
machine.send({ type: 'FOCUS_SEGMENT', segment: 'month' })
machine.send({ type: 'TYPE_DIGIT', digit: '1' })
machine.stop()
```

#### Options

| Option | Type | Default |
|---|---|---|
| `id` | `string` | required |
| `value` | `CalendarDate \| null` | — |
| `defaultValue` | `CalendarDate \| null` | — |
| `locale` | `string` | `"en-US"` |
| `disabled` | `boolean` | `false` |
| `readOnly` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `invalid` | `boolean` | `false` |
| `min` | `CalendarDate` | — |
| `max` | `CalendarDate` | — |
| `isDateUnavailable` | `(date: CalendarDate) => boolean` | — |
| `onValueChange` | `(date: CalendarDate \| null) => void` | — |

```ts
interface CalendarDate {
  year: number
  month: number  // 1-indexed (January = 1)
  day: number
}
```

### Events

| Event | Payload | Description |
|---|---|---|
| `FOCUS_SEGMENT` | `{ segment: string }` | Focus month / day / year segment |
| `BLUR_SEGMENT` | — | Blur active segment |
| `TYPE_DIGIT` | `{ digit: string }` | User pressed a numeric key |
| `INCREMENT` | — | ArrowUp — increment focused segment |
| `DECREMENT` | — | ArrowDown — decrement focused segment |
| `CLEAR_SEGMENT` | — | Delete / Backspace — clear focused segment |
| `NEXT_SEGMENT` | — | Tab / ArrowRight — move to next segment |
| `PREV_SEGMENT` | — | Shift+Tab / ArrowLeft — move to previous segment |
| `SET_VALUE` | `{ value: CalendarDate }` | Set complete date programmatically |

### `connectDateField(snapshot, send, machine)`

```ts
const api = connectDateField(machine.getSnapshot(), machine.send, machine)

api.assembledDate    // CalendarDate | null  complete date (null until all segments filled)
api.isoValue         // string              ISO 8601 string (e.g. "2025-06-15") or ""
api.focusedSegment   // "month" | "day" | "year" | null
api.displayValues    // { month: string; day: string; year: string }  formatted display

api.getGroupProps()          // container with segments — role implied by context
api.getMonthSegmentProps()   // role="spinbutton", aria-valuemin/max/now, keyboard events
api.getDaySegmentProps()     // same
api.getYearSegmentProps()    // same
api.getSeparatorProps()      // "/" or "-" literal separator
api.getHiddenInputProps()    // hidden <input type="hidden"> with ISO value for forms
```

## States

The machine tracks the `focusedSegment` and individually typed digit buffers per segment. No named open/closed states.

## Segment entry behavior

- Typing `0` then `6` in the month segment → "June" (two-digit buffered entry)
- Typing a digit that can only be valid as a single digit (e.g. `7` for month) → auto-advances to next segment
- `ArrowUp` / `ArrowDown` → increment/decrement with wraparound (month 12 → 1)
- `Delete` / `Backspace` → clears the focused segment

## Data attributes

| Attribute | Values | Elements |
|---|---|---|
| `data-forge-scope` | `"date-field"` | all |
| `data-forge-part` | `"group"` / `"month-segment"` / `"day-segment"` / `"year-segment"` / `"separator"` | |
| `data-focused` | `""` | currently focused segment |
| `data-disabled` | `""` | disabled state |
| `data-readonly` | `""` | read-only state |
| `data-invalid` | `""` | invalid date or outside min/max |

## WAI-ARIA

Each segment: `role="spinbutton"`, `aria-valuenow` (numeric), `aria-valuemin`, `aria-valuemax`, `aria-valuetext` (e.g. "June" for month 6), `aria-label` (e.g. "Month"), `aria-required`.
