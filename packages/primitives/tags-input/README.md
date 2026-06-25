# @forge-ui/tags-input

Framework-agnostic Tags Input machine and connect function. Multi-value text input with pill-style tags. Supports delimiter-based entry, paste splitting, max tag limit, duplicate prevention, and custom validation.

> Consumed by `@forge-ui/react` and `@forge-ui/vue`. For multi-select with a dropdown, use `@forge-ui/combobox` with `TagsInput`.

## Install

```bash
npm install @forge-ui/tags-input
```

## API

### `createTagsInputMachine(options)`

```ts
import { createTagsInputMachine } from '@forge-ui/tags-input'

const machine = createTagsInputMachine({
  id: 'tech-stack',
  defaultValue: ['React'],
  delimiter: ',',
  maxTags: 10,
  allowDuplicates: false,
  onValueChange: (values) => console.log(values),
  onTagAdd: (value) => console.log('added', value),
  onTagRemove: (value) => console.log('removed', value),
})

machine.start()
machine.send({ type: 'ADD_TAG', value: 'TypeScript' })
machine.send({ type: 'REMOVE_TAG', value: 'React' })
machine.stop()
```

#### Options

| Option | Type | Default |
|---|---|---|
| `id` | `string` | required |
| `value` | `string[]` | — |
| `defaultValue` | `string[]` | `[]` |
| `disabled` | `boolean` | `false` |
| `readOnly` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `invalid` | `boolean` | `false` |
| `maxTags` | `number` | — |
| `allowDuplicates` | `boolean` | `false` |
| `delimiter` | `string` | `","` |
| `validate` | `(value: string) => boolean` | — |
| `translations` | `Partial<TagsInputTranslations>` | — |
| `onValueChange` | `(values: string[]) => void` | — |
| `onInputChange` | `(value: string) => void` | — |
| `onTagAdd` | `(value: string) => void` | — |
| `onTagRemove` | `(value: string) => void` | — |

> Tags are confirmed on: `Enter`, typing the `delimiter`, or `Blur` (if input is non-empty). `Backspace` on an empty input removes the last tag.

### Events

| Event | Payload | Description |
|---|---|---|
| `FOCUS` / `BLUR` | — | Focus state |
| `INPUT_CHANGE` | `{ value }` | User typing |
| `ADD_TAG` | `{ value }` | Add a tag (validates, deduplicates, checks maxTags) |
| `REMOVE_TAG` | `{ value }` | Remove a specific tag |
| `REMOVE_LAST_TAG` | — | Remove last tag (Backspace on empty input) |
| `SET_VALUE` | `{ value: string[] }` | Replace entire value array |

### `connectTagsInput(snapshot, send, machine)`

```ts
const api = connectTagsInput(machine.getSnapshot(), machine.send, machine)

api.value        // string[]
api.inputValue   // string  current text in input
api.isFocused    // boolean
api.isEmpty      // boolean  no tags
api.isDisabled   // boolean
api.isReadOnly   // boolean
api.isRequired   // boolean
api.isInvalid    // boolean
api.canAddMore   // boolean  false when maxTags reached
api.delimiter    // string

api.getRootProps()             // container div — click to focus input
api.getLabelProps()            // <label>
api.getInputProps()            // text input — Enter/Backspace/delimiter handling
api.getTagProps(value)         // individual tag pill — data-value
api.getTagDeleteProps(value)   // delete button inside a tag
api.getHiddenInputProps()      // hidden <input> (comma-separated values) for forms
api.getLiveRegionProps()       // aria-live="polite" announcements
```

## States

| State | Description |
|---|---|
| `idle` | Not focused |
| `focused` | Input or a tag is focused |

## Data attributes

| Attribute | Values | Elements |
|---|---|---|
| `data-forge-scope` | `"tags-input"` | all |
| `data-forge-part` | `"root"` / `"label"` / `"input"` / `"tag"` / `"tag-delete"` | |
| `data-focused` | `""` | root when focused |
| `data-disabled` | `""` | disabled elements |
| `data-invalid` | `""` | invalid state |
| `data-empty` | `""` | root when no tags |

## WAI-ARIA

- Tags: each tag renders as a `<span>` with a delete `<button>`. The button has `aria-label="Remove {value}"` (from `translations`).
- Live region: `aria-live="polite"` announces tag additions and removals to screen readers.
- Input: standard `<input>` — `aria-label` should be provided.
