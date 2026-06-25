# @forge-ui/progress

Framework-agnostic Progress connect function. WAI-ARIA [Progressbar Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/meter/). Stateless — computes derived values from props. Supports determinate and indeterminate states.

> Consumed by `@forge-ui/react` and `@forge-ui/vue`.

## Install

```bash
npm install @forge-ui/progress
```

## API

Progress has no FSM — it is a pure connect that computes display values from `value`, `min`, and `max`.

### `connectProgress(context)`

```ts
import { connectProgress } from '@forge-ui/progress'

const api = connectProgress({
  value: 65,   // null for indeterminate
  min: 0,
  max: 100,
  getValueLabel: (value, max) => `${value} of ${max} tasks`,
})

api.value    // number | null
api.min      // number
api.max      // number
api.percent  // number | null  — (value - min) / (max - min) * 100
api.state    // "loading" | "complete" | "indeterminate"

api.getRootProps()       // role="progressbar", aria-valuenow, aria-valuemin, aria-valuemax, aria-valuetext
api.getTrackProps()      // visual track container
api.getFillProps()       // filled segment — inline style: width/height as percent
api.getLabelProps()      // label element
api.getValueTextProps()  // human-readable value display
```

#### Context options

| Option | Type | Default |
|---|---|---|
| `value` | `number \| null` | required |
| `min` | `number` | `0` |
| `max` | `number` | `100` |
| `getValueLabel` | `(value: number, max: number) => string` | — |

## States

| `api.state` | Condition |
|---|---|
| `"indeterminate"` | `value === null` |
| `"loading"` | `value !== null && value < max` |
| `"complete"` | `value >= max` |

## Data attributes

| Attribute | Values | Elements |
|---|---|---|
| `data-forge-scope` | `"progress"` | all |
| `data-forge-part` | `"root"` / `"track"` / `"fill"` / `"label"` / `"value-text"` | |
| `data-state` | `"loading"` / `"complete"` / `"indeterminate"` | root, fill |

## WAI-ARIA

Root renders `role="progressbar"` with:
- `aria-valuenow` — omitted when indeterminate
- `aria-valuemin` / `aria-valuemax`
- `aria-valuetext` — from `getValueLabel` when provided
