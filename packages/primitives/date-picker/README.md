# @forge-ui/date-picker

Framework-agnostic Date Picker machine and connect function. Calendar popup with day / month / year views, presets, min/max constraints, locale support, and disabled dates.

> Consumed by `@forge-ui/react` and `@forge-ui/vue`. Use directly only for custom framework bindings.

## Install

```bash
npm install @forge-ui/date-picker
```

## API

### Types

```ts
interface CalendarDate {
  year: number
  month: number  // 1-indexed (January = 1)
  day: number
  timezone?: string  // optional IANA identifier — forge-ui arithmetic ignores this field
}

interface DatePreset {
  label: string
  date: CalendarDate
}
```

### `createDatePickerMachine(options)`

```ts
import { createDatePickerMachine } from '@forge-ui/date-picker'

const machine = createDatePickerMachine({
  id: 'birthdate',
  locale: 'en-US',
  firstDayOfWeek: 0,      // 0=Sunday, 1=Monday … 6=Saturday
  min: { year: 1900, month: 1, day: 1 },
  max: { year: 2100, month: 12, day: 31 },
  isDateUnavailable: (date) => date.day === 13,  // custom validator
  disabledWeekdays: [0, 6],                      // disable Sat/Sun
  presets: [
    { label: 'Today', date: today },
    { label: 'Tomorrow', date: tomorrow },
  ],
  onValueChange: (date) => console.log(date),
  onOpenChange: (open) => console.log('open:', open),
})

machine.start()
machine.send('OPEN')
machine.send({ type: 'SELECT_DAY', date: { year: 2025, month: 6, day: 15 } })
machine.stop()
```

#### Options

| Option | Type | Default |
|---|---|---|
| `id` | `string` | required |
| `value` | `CalendarDate \| null` | `null` |
| `defaultValue` | `CalendarDate \| null` | `null` |
| `locale` | `string` | `"en-US"` |
| `firstDayOfWeek` | `0–6` | `0` (Sunday) |
| `numberOfMonths` | `number` | `1` |
| `min` | `CalendarDate` | — |
| `max` | `CalendarDate` | — |
| `isDateUnavailable` | `(date: CalendarDate) => boolean` | — |
| `disabledWeekdays` | `number[]` | — |
| `presets` | `DatePreset[]` | — |
| `onValueChange` | `(date: CalendarDate \| null) => void` | — |
| `onOpenChange` | `(open: boolean) => void` | — |

### Events

| Event | Description |
|---|---|
| `OPEN` / `CLOSE` / `TOGGLE` | Open/close popup |
| `ESCAPE_KEY` | Close popup |
| `SELECT_DAY { date }` | Select a calendar day |
| `SELECT_MONTH { month }` | Select month in month view |
| `SELECT_YEAR { year }` | Select year in year view |
| `SELECT_PRESET { date }` | Select a preset date |
| `SELECT_FOCUSED` | Confirm keyboard-focused date |
| `VIEW_MONTHS` / `VIEW_YEARS` / `VIEW_DAYS` | Switch calendar views |
| `NAVIGATE_PREV_MONTH` / `NAVIGATE_NEXT_MONTH` | Month navigation |
| `NAVIGATE_TO_MONTH { year, month }` | Jump to specific month |
| `NAVIGATE_PREV_YEAR_RANGE` / `NAVIGATE_NEXT_YEAR_RANGE` | Year grid pagination |
| `FOCUS_DAY` / `FOCUS_PREV_DAY` / `FOCUS_NEXT_DAY` | Keyboard day navigation |
| `FOCUS_PREV_WEEK` / `FOCUS_NEXT_WEEK` | Week navigation (ArrowUp/Down) |
| `FOCUS_PREV_MONTH` / `FOCUS_NEXT_MONTH` | Month boundary navigation |
| `FOCUS_WEEK_START` / `FOCUS_WEEK_END` | Home/End in day grid |

### `connectDatePicker(snapshot, send, machine)`

```ts
import { connectDatePicker } from '@forge-ui/date-picker'

const api = connectDatePicker(machine.getSnapshot(), machine.send, machine)

api.isOpen          // boolean
api.value           // CalendarDate | null
api.focusedDate     // CalendarDate
api.today           // CalendarDate  SSR-safe
api.locale          // string
api.firstDayOfWeek  // number
api.weeks           // CalendarCell[][]  grid structure

api.getRootProps()
api.getTriggerProps()          // open/close button
api.getContentProps()          // calendar panel (role="dialog")
api.getCalendarHeaderProps()   // month/year display text
api.getViewSwitchButtonProps() // switch to month/year view
api.getPrevMonthButtonProps()  // ← prev month
api.getNextMonthButtonProps()  // → next month
api.getPrevYearRangeButtonProps()  // ← prev decade (year view)
api.getNextYearRangeButtonProps()  // → next decade (year view)
api.getCalendarGridProps()     // table/grid wrapper
api.getCalendarRowProps(weekIndex)
api.getWeekdayHeaderProps(dayIndex)   // column headers (Mon/Tue/…)
api.getCalendarCellProps(date)        // individual day cell
api.getMonthGridProps()        // month picker grid
api.getMonthCellProps(month)   // individual month cell
api.getYearGridProps()         // year picker grid
api.getYearCellProps(year)     // individual year cell
api.getPresetProps(preset)     // preset quick-select button
api.getHiddenInputProps(name?) // hidden <input> for form submission
```

## States

| State | Description |
|---|---|
| `closed` | Calendar hidden |
| `open.day` | Day grid visible |
| `open.month` | Month picker visible |
| `open.year` | Year picker visible |

All open states share the `["open"]` tag: `snapshot.hasTag("open")` is `true` in any open state.

## Data attributes

| Attribute | Values | Elements |
|---|---|---|
| `data-forge-scope` | `"date-picker"` | all |
| `data-forge-part` | `"trigger"` / `"content"` / `"cell"` / `"month-cell"` / `"year-cell"` / … | |
| `data-state` | `"open"` / `"closed"` | trigger, content |
| `data-selected` | `""` | selected day/month/year |
| `data-focused` | `""` | keyboard-focused cell |
| `data-today` | `""` | today's cell |
| `data-disabled` | `""` | unavailable/out-of-range cells |
| `data-outside-month` | `""` | day cells belonging to adjacent months |
| `data-weekend` | `""` | weekend cells |

## Calendar date arithmetic

The machine exposes `isDateDisabled(date)` internally using `min`, `max`, `isDateUnavailable`, and `disabledWeekdays`. All arithmetic is timezone-naive — the optional `timezone` field on `CalendarDate` is preserved for consumers but ignored by the machine.
