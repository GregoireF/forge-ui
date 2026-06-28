# @forge-ui/field

Framework-agnostic Field connect function. Provides a shared ID context for accessible form field groups: label, control, description, and error are all linked by auto-generated IDs.

> Consumed by `@forge-ui/react` and `@forge-ui/vue`. Field has no FSM — it is a stateless connect that generates and wires ARIA IDs.

## Install

```bash
npm install @forge-ui/field
```

## API

### `connectField(context)`

```ts
import { connectField } from '@forge-ui/field'

const api = connectField({
  id: 'email-field',  // auto-generated if omitted
  invalid: false,
  required: true,
  disabled: false,
  readOnly: false,
})

api.getLabelProps()              // htmlFor → controlId
api.getControlProps()           // id, aria-describedby, aria-errormessage, aria-invalid, aria-required, aria-disabled
api.getDescriptionProps()       // id (referenced by aria-describedby)
api.getErrorProps()             // id (referenced by aria-errormessage), aria-live="polite"
api.getRequiredIndicatorProps() // aria-hidden="true" (decorative asterisk)
api.getGroupProps()             // wraps the whole field
```

#### Context options

| Option | Type | Default |
|---|---|---|
| `id` | `string` | auto |
| `invalid` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `disabled` | `boolean` | `false` |
| `readOnly` | `boolean` | `false` |

## Generated IDs

From a root `id` of `"email-field"`:

| Element | ID |
|---|---|
| Label | — (uses `htmlFor`) |
| Control | `"email-field"` |
| Description | `"email-field-description"` |
| Error | `"email-field-error"` |

## Usage pattern

Field is a compositional primitive — it wraps any input, not just forge-ui ones. Use `getControlProps()` on the actual `<input>` or via `asChild`:

```ts
// React
<Field.Root required invalid={!!errorMessage}>
  <Field.Label>Email</Field.Label>
  <Field.Control asChild>
    <input type="email" />
  </Field.Control>
  <Field.Description>Used for login only.</Field.Description>
  {errorMessage && <Field.Error>{errorMessage}</Field.Error>}
  <Field.RequiredIndicator>*</Field.RequiredIndicator>
</Field.Root>
```

## Data attributes

| Attribute | Values | Elements |
|---|---|---|
| `data-forge-scope` | `"field"` | all |
| `data-forge-part` | `"root"` / `"label"` / `"control"` / `"description"` / `"error"` | |
| `data-invalid` | `""` | when `invalid: true` |
| `data-required` | `""` | when `required: true` |
| `data-disabled` | `""` | when `disabled: true` |
| `data-readonly` | `""` | when `readOnly: true` |

## WAI-ARIA

- `control`: `aria-describedby` → description ID (always), `aria-errormessage` → error ID (when invalid), `aria-invalid="true"` (when invalid), `aria-required="true"` (when required)
- `error`: `aria-live="polite"` so screen readers announce new error messages
- `requiredIndicator`: `aria-hidden="true"` — the asterisk is decorative; `aria-required` on the control is the semantic signal
