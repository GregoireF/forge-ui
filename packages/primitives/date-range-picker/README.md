# @forge-ui/date-range-picker

Framework-agnostic Date Range Picker machine and connect function. Calendar popup for selecting a start and end date. Two-phase selection with visual hover preview. Supports min/max, disabled dates, presets, and locale.

> Consumed by `@forge-ui/react` and `@forge-ui/vue`. For single-date selection, use `@forge-ui/date-picker`.

## Install

```bash
npm install @forge-ui/date-range-picker
```

## API

### `createDateRangePickerMachine(options)`

```ts
import { createDateRangePickerMachine } from '@forge-ui/date-range-picker'

const machine = createDateRangePickerMachine({
  id: 'stay',
  locale: 'en-US',
  firstDayOfWeek: 1,  // Monday
  min: { year: 2025, month: 1, day: 1 },
  presets: [
    { label: 'This week', start: thisWeekStart, end: thisWeekEnd },
    { label: 'This month', start: monthStart, end: monthEnd },
  ],
  onValueChange: ({ start, end }) => console.log(start, end),
})

machine.start()
machine.send('OPEN')
machine.send({ type: 'SELECT_DAY', date: { year: 2025, month: 6, day: 10 } })
machine.send({ type: 'SELECT_DAY', date: { year: 2025, month: 6, day: 20 } })
machine.stop()
```

#### Options

| Option | Type | Default |
|---|---|---|
| `id` | `string` | required |
| `value` | `{ start: CalendarDate; end: CalendarDate } \| null` | — |
| `defaultValue` | same | — |
| `locale` | `string` | `"en-US"` |
| `firstDayOfWeek` | `0–6` | `0` |
| `numberOfMonths` | `number` | `1` |
| `min` | `CalendarDate` | — |
| `max` | `CalendarDate` | — |
| `isDateUnavailable` | `(date: CalendarDate) => boolean` | — |
| `disabledWeekdays` | `number[]` | — |
| `presets` | `RangePreset[]` | — |
| `onValueChange` | `({ start, end }: DateRange) => void` | — |
| `onOpenChange` | `(open: boolean) => void` | — |

```ts
interface CalendarDate { year: number; month: number; day: number }
interface DateRange    { start: CalendarDate; end: CalendarDate }
interface RangePreset  { label: string; start: CalendarDate; end: CalendarDate }
```

### Selection phases

1. **Phase 1** (`selectionPhase: "start"`): user clicks the start date
2. **Phase 2** (`selectionPhase: "end"`): user hovers to preview the range, then clicks the end date. If the end click is earlier than the start, the values are swapped automatically.

Clicking outside the calendar or pressing Escape resets to phase 1 if only one date is selected.

### Events

| Event | Description |
|---|---|
| `OPEN` / `CLOSE` / `TOGGLE` | Open/close popup |
| `ESCAPE_KEY` | Close popup |
| `SELECT_DAY { date }` | Select a calendar day (advances phase) |
| `HOVER_DAY { date }` | Hover preview while in phase 2 |
| `CLEAR_HOVER` | Reset hover preview |
| `SELECT_PRESET { start, end }` | Apply a preset range |
| `CLEAR` | Clear the selection |
| `NAVIGATE_PREV_MONTH` / `NAVIGATE_NEXT_MONTH` | Month navigation |
| `FOCUS_DAY` / `FOCUS_PREV_DAY` / `FOCUS_NEXT_DAY` | Keyboard navigation |
| `FOCUS_PREV_WEEK` / `FOCUS_NEXT_WEEK` | Week navigation |
| `FOCUS_WEEK_START` / `FOCUS_WEEK_END` | Home/End in day grid |

### `connectDateRangePicker(snapshot, send, machine)`

```ts
const api = connectDateRangePicker(machine.getSnapshot(), machine.send, machine)

api.isOpen           // boolean
api.selectionPhase   // "start" | "end"
api.startDate        // CalendarDate | null
api.endDate          // CalendarDate | null
api.hoveredDate      // CalendarDate | null  (preview during phase 2)
api.formattedStart   // string  locale-formatted start date
api.formattedEnd     // string  locale-formatted end date
api.formattedRange   // string  combined display (e.g. "Jun 10 – Jun 20, 2025")
api.weeksPerMonth    // CalendarCell[][]
api.weekdays         // string[]  localized day names
api.presets          // RangePreset[]

api.getTriggerProps()
api.getContentProps()          // role="dialog"
api.getCalendarHeaderProps()   // month/year display
api.getPrevMonthButtonProps()
api.getNextMonthButtonProps()
api.getCalendarGridProps()
api.getCalendarRowProps(weekIndex)
api.getWeekdayHeaderProps(dayIndex)
api.getCalendarCellProps(date)  // data-in-range, data-range-start, data-range-end, data-in-hover-range
api.getClearButtonProps()
api.getPresetProps(preset)
api.getHiddenStartInputProps()  // hidden <input name="start">
api.getHiddenEndInputProps()    // hidden <input name="end">
```

## States

| State | Description |
|---|---|
| `closed` | Calendar hidden |
| `open` | Calendar visible — two phases of selection |

## Data attributes

| Attribute | Values | Elements |
|---|---|---|
| `data-forge-scope` | `"date-range-picker"` | all |
| `data-forge-part` | `"trigger"` / `"content"` / `"cell"` / … | |
| `data-state` | `"open"` / `"closed"` | trigger, content |
| `data-in-range` | `""` | cells between start and end |
| `data-range-start` | `""` | the start date cell |
| `data-range-end` | `""` | the end date cell |
| `data-in-hover-range` | `""` | cells in the hover preview (phase 2) |
| `data-selected` | `""` | start or end date cell |
| `data-today` | `""` | today's cell |
| `data-disabled` | `""` | unavailable cells |
| `data-outside-month` | `""` | cells from adjacent months |
