# @forge-ui/avatar

Framework-agnostic Avatar machine and connect function. Displays a user image with an accessible fallback (initials, icon, placeholder) when the image is loading, has errored, or when no `src` is provided.

> Consumed by `@forge-ui/react` and `@forge-ui/vue`.

## Install

```bash
npm install @forge-ui/avatar
```

## API

### `createAvatarMachine(options)`

Pure FSM — tracks image loading status. Deliberately minimal: no `delayMs`, no `showFallback`. These are view concerns and live in the framework layer.

```ts
import { createAvatarMachine, connectAvatar } from '@forge-ui/avatar'

const machine = createAvatarMachine({
  id: 'user-avatar',
  src: 'https://example.com/photo.jpg',
  alt: 'Alice',
  name: 'Alice Smith',
  onStatusChange: (status) => console.log('[avatar]', status),
})

machine.start()
```

#### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | auto | Unique identifier |
| `src` | `string` | — | Image URL (can also be set later via `SRC_CHANGE`) |
| `alt` | `string` | `""` | Accessible label for the `<img>` element |
| `name` | `string` | — | Full name — used to compute initials (exposed via connect's `initials`) |
| `onStatusChange` | `(status: AvatarImageStatus) => void` | — | Called when image status changes |

#### Machine states

| State | Tag | Description |
|---|---|---|
| `idle` | `fallback` | No src provided — always show fallback |
| `loading` | `loading` | Image is fetching |
| `loaded` | `loaded` | Image decoded and displayed |
| `error` | `fallback` | Image failed — show fallback |

#### Events

| Event | Description |
|---|---|
| `IMAGE_LOAD` | Image finished loading (fires from `onLoad` handler) |
| `IMAGE_ERROR` | Image failed to load (fires from `onError` handler) |
| `SRC_CHANGE` | Src changed — restarts the loading cycle |

### `connectAvatar(snapshot, send, machine)`

Returns an API object with prop-getter functions and reactive state.

```ts
const api = connectAvatar(snapshot, send, machine)

api.status          // "idle" | "loading" | "loaded" | "error"
api.isLoaded        // boolean
api.isLoading       // boolean
api.hasError        // boolean
api.isIdle          // boolean
api.initials        // "JD" from name="John Doe" — "" when name not provided

api.getRootProps()      // container: data-forge-scope/part, data-status
api.getImageProps()     // img: src, alt, onLoad, onError, data-state, data-forge-*
api.getFallbackProps()  // base props only — data-state and aria-hidden set by framework
api.setSrc(src)         // imperative: update src and restart loading
```

### `getInitials(name: string): string`

Pure utility — derives initials from a full name string:
- `"John Doe"` → `"JD"`
- `"Alice"` → `"A"`
- `"Ana Garcia Lopez"` → `"AG"` (max 2 words)

## Usage — React

```tsx
import { Avatar } from '@forge-ui/react'

function UserAvatar({ src, name }: { src?: string; name: string }) {
  return (
    <Avatar.Root
      name={name}
      onStatusChange={(s) => console.log('[avatar]', s)}
      style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', position: 'relative' }}
    >
      <Avatar.Image
        src={src}
        alt={name}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      {/* delayMs on Fallback — prevents flash-of-fallback on fast connections */}
      <Avatar.Fallback delayMs={600} style={{ /* your styles */ }}>
        {/* Use asChild to render as any element */}
        {name.slice(0, 2).toUpperCase()}
      </Avatar.Fallback>
    </Avatar.Root>
  )
}
```

**Auto-initials with `useAvatarContext` (recommended — no duplicate machine):**

```tsx
import { Avatar, useAvatarContext } from '@forge-ui/react'

// Child component reads initials from the nearest <Avatar.Root>
function InitialsFallback({ style }: { style?: React.CSSProperties }) {
  const { initials } = useAvatarContext()
  return <Avatar.Fallback style={style}>{initials}</Avatar.Fallback>
}

function UserAvatar({ src, name }: { src?: string; name: string }) {
  return (
    <Avatar.Root name={name} style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', position: 'relative' }}>
      <Avatar.Image src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <InitialsFallback style={{ /* your fallback styles */ }} />
    </Avatar.Root>
  )
}
```

### React Props

#### `<Avatar.Root>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | auto | Machine ID |
| `alt` | `string` | `""` | Image alt text |
| `name` | `string` | — | Full name for auto-initials |
| `onStatusChange` | `(status: string) => void` | — | Status change callback |
| `asChild` | `boolean` | `false` | Render as child element |

#### `<Avatar.Image>`

Accepts all `<img>` attributes except `onLoad`/`onError` (managed internally).

| Prop | Type | Description |
|---|---|---|
| `src` | `string` | Image URL — changes drive the machine via `useLayoutEffect` |
| `asChild` | `boolean` | Render as child element (e.g. Next.js `<Image>`) |

#### `<Avatar.Fallback>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `delayMs` | `number` | `0` | Wait this long before showing the fallback while loading. Prevents flash-of-fallback on fast connections |
| `forceMount` | `boolean` | `false` | Keep the element in the DOM even when hidden (image loaded). Use for CSS exit animations or `AnimatePresence` |
| `asChild` | `boolean` | `false` | Render as child element |

## Usage — Vue

```vue
<script setup lang="ts">
import { Avatar } from '@forge-ui/vue'
</script>

<template>
  <Avatar.Root
    name="Alice Smith"
    style="width: 40px; height: 40px; border-radius: 50%; overflow: hidden; position: relative"
  >
    <Avatar.Image
      src="https://example.com/photo.jpg"
      alt="Alice Smith"
      style="width: 100%; height: 100%; object-fit: cover"
    />
    <!-- delayMs on Fallback, not Root -->
    <Avatar.Fallback :delay-ms="600" style="...">AS</Avatar.Fallback>
  </Avatar.Root>
</template>
```

**Auto-initials with `injectAvatarContext` (recommended — reads from nearest Root):**

```vue
<!-- InitialsFallback.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { Avatar, injectAvatarContext } from '@forge-ui/vue'

const props = defineProps<{ style?: object }>()
const { initials } = injectAvatarContext()
</script>

<template>
  <Avatar.Fallback :style="props.style">{{ initials }}</Avatar.Fallback>
</template>
```

```vue
<!-- Usage -->
<Avatar.Root name="John Doe" ...>
  <Avatar.Image alt="John Doe" ... />
  <InitialsFallback :style="fallbackStyle" />
</Avatar.Root>
```

### Vue Props

#### `<AvatarRoot>` / `<Avatar.Root>`

| Prop | Type | Default |
|---|---|---|
| `id` | `string` | auto |
| `alt` | `string` | — |
| `name` | `string` | — |
| `onStatusChange` | `(status: string) => void` | — |
| `asChild` | `boolean` | `false` |

#### `<AvatarImage>` / `<Avatar.Image>`

| Prop | Type | Description |
|---|---|---|
| `src` | `string` | Image URL, watched reactively |
| `alt` | `string` | Overrides Root `alt` |
| `asChild` | `boolean` | Render as child element |

#### `<AvatarFallback>` / `<Avatar.Fallback>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `delayMs` | `number` | `0` | Delay before fallback appears while loading |
| `forceMount` | `boolean` | `false` | Keep in DOM even when hidden. Use for CSS exit animations or `<Transition>` |
| `asChild` | `boolean` | `false` | Render as child element |

## CSS integration

```css
/* Hide image while not loaded */
[data-forge-part="image"]:not([data-state="loaded"]) {
  display: none;
}

/* Hide fallback when image is loaded */
[data-forge-part="fallback"][data-state="hidden"] {
  display: none;
}
```

`data-status` on the root element mirrors the machine state for advanced CSS:

```css
[data-forge-part="root"][data-status="loading"] {
  /* e.g. pulsing skeleton */
}
```

## Accessibility

- The `<img>` has the user-provided `alt` text as its accessible name — sufficient for screen readers.
- Fallback: `aria-hidden="true"` when hidden (image loaded), no `aria-hidden` when visible.
- No `role` is forced on the container — it's a neutral presentational wrapper.
- SSR-safe: machine starts in `idle` state when no `src` is provided, avoiding hydration mismatches.

## Competitive comparison

| Feature | forge-ui | Radix UI | Ark UI |
|---|---|---|---|
| SSR-safe (no hydration mismatch) | ✅ | ✅ | ✅ |
| `delayMs` on Fallback | ✅ | ✅ | ✅ |
| `name` → auto-initials (`api.initials`) | ✅ | ❌ | ❌ |
| `onStatusChange` callback | ✅ | ❌ | ✅ |
| `asChild` on Root/Image/Fallback | ✅ | ✅ | ✅ |
| CSS `data-state` / `data-status` | ✅ | ✅ | ✅ |
| Correct `aria-hidden` on Fallback | ✅ | ✅ | ✅ |
| Machine-driven (FSM) | ✅ | ❌ | ✅ |
| Framework-agnostic core | ✅ | ❌ | ✅ |
| 3-tier architecture (machine/connect/framework) | ✅ | ❌ | ✅ |
