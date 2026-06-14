# @forge-ui/core

Framework-agnostic FSM engine and accessibility utilities powering the forge-ui primitive layer.

> This package is the **infrastructure layer** — it is not meant to be used directly in application code. Use `@forge-ui/react`, `@forge-ui/vue`, or `@forge-ui/nuxt` instead.

## What's inside

### `createMachine`

Finite-state machine engine. Supports states, transitions, guards, entry/exit actions, and **activities** (long-running effects tied to a state — started on entry, cleaned up on exit).

```ts
import { createMachine } from '@forge-ui/core'

const machine = createMachine({
  id: 'toggle',
  initial: 'off',
  context: { label: 'Toggle' },
  states: {
    off: { on: { TOGGLE: { target: 'on' } } },
    on:  { on: { TOGGLE: { target: 'off' } } },
  },
})

machine.start()
machine.send('TOGGLE')
console.log(machine.getSnapshot().value) // 'on'
machine.stop()
```

#### Machine API

| Method | Description |
|---|---|
| `start()` | Start the machine, run entry actions + activities of the initial state |
| `stop()` | Stop all activities and clear listeners |
| `send(event)` | Send an event (string or `{ type, ...payload }`) |
| `getSnapshot()` | Return the current `MachineSnapshot` (stable reference between transitions) |
| `subscribe(listener)` | Subscribe to state changes; returns an unsubscribe function |
| `setContext(updates)` | Mutate context in-place (used by ref callbacks for DOM elements) |

#### `MachineSnapshot`

```ts
type MachineSnapshot<TContext, TState> = {
  value: TState
  context: TContext
  tags: ReadonlyArray<string>
  matches: (...states: TState[]) => boolean
  hasTag: (tag: string) => boolean
}
```

### Utilities

| Export | Description |
|---|---|
| `focusFirst(container)` | Focus the first focusable element inside a container |
| `trapFocus(container, event)` | Trap Tab / Shift+Tab within a container |
| `getFocusableElements(container)` | Return all focusable elements in order |
| `lockScroll(el?)` | Lock body scroll (iOS-safe, compensates for scrollbar width) |
| `hideOthers(target)` | Set `aria-hidden="true"` on all DOM nodes except `target` and its ancestors |
| `interactOutside(target, handler)` | Call `handler` on pointerdown outside `target`; returns cleanup |
| `generateId()` | Random string ID (SSR-safe) |
| `isBrowser()` | `typeof window !== 'undefined'` |
| `getDocument(el?)` | SSR-safe `document` access |
| `getWindow(el?)` | SSR-safe `window` access |

## Design notes

- **Mutable context**: `setContext` uses `Object.assign` — activities hold a reference to the live context object and always see the latest DOM refs without needing to restart.
- **Stable snapshot**: `getSnapshot()` returns the same object reference between transitions. A new object is only created on `send()` so `useSyncExternalStore` (React) and Vue reactive comparisons work correctly.
- **Activities pattern**: A Zag.js-style effect — a function `(context, { send }) => cleanup | void`. Started when entering a state, cleaned up when leaving it or when `stop()` is called.
