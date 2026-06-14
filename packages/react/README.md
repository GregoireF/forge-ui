# @forge-ui/react

React 19+ bindings for forge-ui headless UI primitives.

## Install

```bash
npm install @forge-ui/react
```

**Peer dependencies**: `react >= 19.0.0`, `react-dom >= 19.0.0`

## Dialog

### Compound API (recommended)

```tsx
import { Dialog } from '@forge-ui/react'

function MyDialog() {
  return (
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
  )
}
```

### Controlled mode

```tsx
const [open, setOpen] = useState(false)

<Dialog.Root open={open} onOpenChange={setOpen}>
  ...
</Dialog.Root>
```

### Hook API

```tsx
import { useDialog, DialogPortal } from '@forge-ui/react'

function MyDialog() {
  const dialog = useDialog()

  return (
    <>
      <button {...dialog.getTriggerProps()}>Open</button>
      {dialog.isOpen && (
        <DialogPortal>
          <div {...dialog.getBackdropProps()} />
          <div {...dialog.getContentProps()}>
            <h2 {...dialog.getTitleProps()}>Title</h2>
            <p {...dialog.getDescriptionProps()}>Description.</p>
            <button {...dialog.getCloseProps()}>Close</button>
          </div>
        </DialogPortal>
      )}
    </>
  )
}
```

### `asChild`

Merge forge-ui props onto your own element instead of the default `<button>`:

```tsx
<Dialog.Trigger asChild>
  <a href="#">Open dialog</a>
</Dialog.Trigger>

<Dialog.Close asChild>
  <MyButton variant="ghost">Cancel</MyButton>
</Dialog.Close>
```

### `forceMount`

Keep content in the DOM when closed — needed for CSS exit animations:

```tsx
<Dialog.Content forceMount>...</Dialog.Content>
```

```css
[data-forge-part="content"][data-state="open"]   { animation: fadeIn  150ms ease; }
[data-forge-part="content"][data-state="closed"] { animation: fadeOut 150ms ease forwards; }
```

## API reference

### `<Dialog.Root>`

| Prop | Type | Default |
|---|---|---|
| `open` | `boolean` | — |
| `onOpenChange` | `(open: boolean) => void` | — |
| `onOpen` | `() => void` | — |
| `onClose` | `() => void` | — |
| `modal` | `boolean` | `true` |
| `closeOnEscapeKey` | `boolean` | `true` |
| `closeOnInteractOutside` | `boolean` | `true` |
| `id` | `string` | auto |

### `<Dialog.Trigger>` / `<Dialog.Close>`

| Prop | Type | Default |
|---|---|---|
| `asChild` | `boolean` | `false` |

### `<Dialog.Overlay>` / `<Dialog.Content>`

| Prop | Type | Default |
|---|---|---|
| `forceMount` | `boolean` | `false` |

### `<Dialog.Portal>`

| Prop | Type | Default |
|---|---|---|
| `container` | `HTMLElement` | `document.body` |

### `useDialog(options?)`

Returns all prop getters plus:

| Property | Type | Description |
|---|---|---|
| `isOpen` | `boolean` | Current open state |
| `setOpen` | `(open: boolean) => void` | Programmatic open/close |

### `useMachine(machine)`

Low-level hook. Binds any forge-ui machine instance to React via `useSyncExternalStore`. Returns `[snapshot, send]`.

## Data attributes

| Attribute | Values | Elements |
|---|---|---|
| `data-state` | `"open"` \| `"closed"` | trigger, overlay, content |
| `data-forge-part` | `"trigger"` \| `"overlay"` \| `"content"` \| `"title"` \| `"description"` \| `"close"` | all |
