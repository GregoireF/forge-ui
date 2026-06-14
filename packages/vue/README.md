# @forge-ui/vue

Vue 3.5+ bindings for forge-ui headless UI primitives.

## Install

```bash
npm install @forge-ui/vue
```

**Peer dependency**: `vue >= 3.5.0`

For Nuxt, use [`@forge-ui/nuxt`](../nuxt) which auto-imports everything.

## Dialog

### Compound API (recommended)

```vue
<script setup>
import { Dialog } from '@forge-ui/vue'
</script>

<template>
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
</template>
```

Alternatively, use named imports:

```vue
<script setup>
import {
  DialogRoot, DialogTrigger, DialogPortal,
  DialogOverlay, DialogContent,
  DialogTitle, DialogDescription, DialogClose,
} from '@forge-ui/vue'
</script>
```

### Controlled mode / v-model

```vue
<script setup>
import { ref } from 'vue'
import { Dialog } from '@forge-ui/vue'

const open = ref(false)
</script>

<template>
  <Dialog.Root v-model:open="open">
    ...
  </Dialog.Root>
</template>
```

### Hook API

```vue
<script setup>
import { useDialog, DialogPortal } from '@forge-ui/vue'

const dialog = useDialog()
</script>

<template>
  <button v-bind="dialog.getTriggerProps()">Open</button>

  <template v-if="dialog.isOpen.value">
    <DialogPortal>
      <div v-bind="dialog.getBackdropProps()" />
      <div v-bind="dialog.getContentProps()">
        <h2 v-bind="dialog.getTitleProps()">Title</h2>
        <p v-bind="dialog.getDescriptionProps()">Description.</p>
        <button v-bind="dialog.getCloseProps()">Close</button>
      </div>
    </DialogPortal>
  </template>
</template>
```

> **Note**: `dialog.isOpen` is a `ComputedRef<boolean>`. Inside `<script setup>` templates, properties of plain objects are **not** auto-unwrapped — always use `dialog.isOpen.value` in `v-if` conditions.

### `asChild`

```vue
<Dialog.Trigger :asChild="true">
  <a href="#">Open dialog</a>
</Dialog.Trigger>
```

### `forceMount`

```vue
<Dialog.Content :forceMount="true">...</Dialog.Content>
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

`v-model:open` is supported and maps to `open` + `onOpenChange`.

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
| `to` | `string \| HTMLElement` | `"body"` |

### `useDialog(options?)`

Returns prop getters plus:

| Property | Type | Description |
|---|---|---|
| `isOpen` | `ComputedRef<boolean>` | Current open state — use `.value` in templates |
| `setOpen` | `(open: boolean) => void` | Programmatic open/close |

### `useMachine(machine)`

Low-level composable. Binds any forge-ui machine to Vue reactivity via a `Ref<MachineSnapshot>`. Returns `{ snapshot, send }`.

## Data attributes

| Attribute | Values | Elements |
|---|---|---|
| `data-state` | `"open"` \| `"closed"` | trigger, overlay, content |
| `data-forge-part` | `"trigger"` \| `"overlay"` \| `"content"` \| `"title"` \| `"description"` \| `"close"` | all |
