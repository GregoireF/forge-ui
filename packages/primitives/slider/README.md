# @forge-ui/slider

Framework-agnostic slider machine and connect function. Multi-thumb, range, vertical orientation, decorative marks.

> Consumed by `@forge-ui/react` and `@forge-ui/vue`. Use directly only for custom framework bindings.

## Install

```bash
npm install @forge-ui/slider
```

## API

### `createSliderMachine(options)`

```ts
import { createSliderMachine } from '@forge-ui/slider'

const machine = createSliderMachine({
  id: 'vol',
  values: [50],          // array — one entry per thumb
  min: 0,
  max: 100,
  step: 1,
  orientation: 'horizontal', // | 'vertical'
  disabled: false,
  marks: [
    { value: 0 },
    { value: 50, label: '50%' },
    { value: 100 },
  ],
  onValueChange: (values) => console.log(values),
  onValueCommit: (values) => console.log('committed', values), // fires on pointerup / keyboard
  getValueLabel: (value, index) => `${value}%`,               // aria-valuetext
})

machine.start()
machine.send({ type: 'INCREMENT', thumbIndex: 0 })
machine.stop()
```

#### Options

| Option | Type | Default |
|---|---|---|
| `id` | `string` | required |
| `values` | `number[]` | `[0]` |
| `min` | `number` | `0` |
| `max` | `number` | `100` |
| `step` | `number` | `1` |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` |
| `disabled` | `boolean` | `false` |
| `marks` | `SliderMark[]` | — |
| `getValueLabel` | `(value: number, index: number) => string` | — |
| `onValueChange` | `(values: number[]) => void` | — |
| `onValueCommit` | `(values: number[]) => void` | — |

```ts
interface SliderMark {
  value: number   // position on the slider scale
  label?: string  // optional text label
}
```

### Events

| Event | Payload | Description |
|---|---|---|
| `POINTER_DOWN` | `{ value, thumbIndex }` | Start drag — sent by track or thumb |
| `POINTER_UP` | — | End drag |
| `INCREMENT` | `{ thumbIndex }` | ArrowRight / ArrowUp |
| `DECREMENT` | `{ thumbIndex }` | ArrowLeft / ArrowDown |
| `INCREMENT_PAGE` | `{ thumbIndex }` | PageUp (+10% of range) |
| `DECREMENT_PAGE` | `{ thumbIndex }` | PageDown (-10% of range) |
| `SET_MIN` | `{ thumbIndex }` | Home key |
| `SET_MAX` | `{ thumbIndex }` | End key |

### `connectSlider(snapshot, send, machine)`

```ts
import { connectSlider } from '@forge-ui/slider'

const api = connectSlider(machine.getSnapshot(), machine.send, machine)

api.values           // number[]    current thumb values
api.percents         // number[]    [0-100] percent per thumb
api.marks            // SliderMark[] decorative marks
api.min              // number
api.max              // number
api.isDragging       // boolean
api.activeThumb      // number      index of dragging thumb (-1 when idle)

api.getRootProps()            // container div
api.getTrackProps()           // track div — onPointerDown (click-to-seek)
api.getRangeProps()           // filled range div
api.getThumbProps(index)      // individual thumb — role="slider", ARIA, keyboard events
api.getHiddenInputProps(name?, index?)  // hidden <input type="range"> for forms
api.getMarkerGroupProps()     // aria-hidden container for marks
api.getMarkerProps(value)     // individual mark — data-in-range, position style
```

## Data attributes

| Attribute | Values | Elements |
|---|---|---|
| `data-forge-scope` | `"slider"` | all |
| `data-forge-part` | `"root"` / `"track"` / `"range"` / `"thumb"` / `"marker-group"` / `"marker"` | |
| `data-orientation` | `"horizontal"` / `"vertical"` | root, track, thumb, markers |
| `data-disabled` | `""` | root, track, thumb when disabled |
| `data-active` | `""` | thumb currently being dragged |
| `data-in-range` | `""` | marks whose value falls within the current slider range |
| `data-index` | `"0"` / `"1"` / … | individual thumbs |

## States

| State | Description |
|---|---|
| `idle` | No interaction |
| `dragging` | Thumb being dragged — `activeThumb` is set |

## WAI-ARIA

Each thumb renders `role="slider"` with:
- `aria-valuenow` — current thumb value
- `aria-valuemin` / `aria-valuemax` — range bounds
- `aria-valuetext` — from `getValueLabel` when provided
- `aria-orientation` — `"horizontal"` or `"vertical"`
- `aria-disabled` — when disabled

The marker group is `aria-hidden="true"` (decorative only).
