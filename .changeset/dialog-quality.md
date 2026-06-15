---
"@forge-ui/dialog": patch
"@forge-ui/react": minor
"@forge-ui/vue": patch
---

**Dialog: dev a11y warnings + controlled-state optimisation + SSR/Nuxt fix**

- `Dialog.Content` warns in development when no accessible name is present (no `<Dialog.Title>`, `aria-label`, or `aria-labelledby`) — React and Vue
- `Dialog.Content` warns in development when no description is present (no `<Dialog.Description>` or `aria-describedby`) — descriptions help assistive-tech users understand the dialog's purpose
- `connectDialog` exposes `titleRegistered` and `descriptionRegistered` booleans on the API; Vue's `useDialog` exposes them as reactive computed refs
- **Fix (React)**: Controlled `open` prop is now synced to the machine during render rather than in a `useLayoutEffect`, collapsing two renders into one per prop change
- **Fix (React)**: `useMachine` starts the machine synchronously so child `useLayoutEffect` hooks (`REGISTER_TITLE` / `REGISTER_DESCRIPTION`) are never dropped when a dialog opens immediately (e.g. `defaultOpen`, `open={true}`, `forceMount`)
- **Fix (Vue/SSR)**: `useMachine` now uses `onScopeDispose` instead of `onUnmounted` — `onUnmounted` never fires during server-side rendering, causing machine instances to leak across Nuxt/SSR requests
