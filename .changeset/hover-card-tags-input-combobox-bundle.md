---
"@forge-ui/hover-card": minor
"@forge-ui/tags-input": minor
"@forge-ui/combobox": minor
"@forge-ui/core": patch
"@forge-ui/select": patch
"@forge-ui/tooltip": patch
"@forge-ui/popover": patch
"@forge-ui/react": minor
"@forge-ui/vue": minor
"@forge-ui/nuxt": minor
---

**✨ New primitive: `@forge-ui/hover-card`**

Hover-triggered card preview (no focus trap). Separate timers for open and close delays. Content stays open while hovering over it.

- `openDelay` (default 700ms) / `closeDelay` (default 300ms)
- `role="dialog"` on Content (WAI-ARIA HoverCard pattern)
- `aria-haspopup="dialog"` + `aria-expanded` on Trigger
- Floating UI positioning — same system as Popover/Tooltip
- `HoverCard.Arrow` supported
- Mouse + keyboard (Focus/Blur) support
- Shared presence context: Portal/Content coordinate on the same `usePresence` instance so CSS exit animations complete before unmount

**Compounds:** `Root`, `Trigger`, `Portal`, `Content`, `Arrow`

```tsx
// React
<HoverCard.Root openDelay={700} closeDelay={300}>
  <HoverCard.Trigger asChild>
    <a href="#">@forge-ui</a>
  </HoverCard.Trigger>
  <HoverCard.Portal>
    <HoverCard.Content>
      <p>Card content — hover me too, I'll stay open.</p>
    </HoverCard.Content>
  </HoverCard.Portal>
</HoverCard.Root>
```

---

**✨ New primitive: `@forge-ui/tags-input`**

Free-form tags input. No dropdown, no suggestions — pure tag management.

- **Enter** → add current input as a tag
- **Backspace** on empty input → remove last tag
- Click `TagDelete` button → remove that tag
- `maxTags`, `allowDuplicates`, `disabled`, `readOnly`, `required`, `invalid` props
- Controlled (`value` + `onValueChange`) and uncontrolled (`defaultValue`) modes
- Hidden `<input type="hidden">` for form submission
- Adds tag on blur if input is non-empty

**Compounds:** `Root`, `Label`, `Input`, `Tag`, `TagDelete`, `HiddenInput`

```tsx
// React
<TagsInput.Root defaultValue={["TypeScript"]} onValueChange={setTags}>
  <TagsInput.Label>Technologies</TagsInput.Label>
  {tags.map(tag => (
    <TagsInput.Tag key={tag} value={tag}>
      {tag}
      <TagsInput.TagDelete value={tag}>✕</TagsInput.TagDelete>
    </TagsInput.Tag>
  ))}
  <TagsInput.Input placeholder="Ajouter..." />
  <TagsInput.HiddenInput />
</TagsInput.Root>
```

---

**✨ `@forge-ui/combobox` — new compounds + virtual scrolling**

- **`Combobox.Group` + `Combobox.GroupLabel`** — display-level grouping (mirrors `Select.Group`). `role="group"` wrapper + `role="presentation"` label.
- **`Combobox.CreateOption`** — creatable pattern. Renders a "Create X" item when `onCreateOption` is set and input value has no exact match. Accepts render function child `(label) => ReactNode`.
- **Virtual scrolling API** — `options` prop bypasses DOM registration; `onHighlightedScroll(value, index)` callback fires on every keyboard navigation so the caller can scroll its virtualizer (TanStack Virtual, etc.).
- **`selectedLabels` persistence** — selected option labels are captured on close so they survive portal unmount in multi-select.

```tsx
// Grouped
<Combobox.Content>
  <Combobox.Group>
    <Combobox.GroupLabel>Frontend</Combobox.GroupLabel>
    <Combobox.Item value="ts" label="TypeScript">TypeScript</Combobox.Item>
  </Combobox.Group>
</Combobox.Content>

// Creatable
<Combobox.Root onCreateOption={(v) => addOption(v)}>
  ...
  <Combobox.CreateOption>{(label) => `Créer "${label}"`}</Combobox.CreateOption>
</Combobox.Root>

// Virtual scrolling
<Combobox.Root
  options={allOptions}
  onHighlightedScroll={(value, index) => rowVirtualizer.scrollToIndex(index)}
>
  ...
</Combobox.Root>
```

---

**🐛 `@forge-ui/core` — `watchPresence` immediate unmount without CSS**

`watchPresence` now checks `getComputedStyle` before setting up the animation-wait timer. When both `animationDuration` and `transitionDuration` are `0` (no CSS applied, jsdom tests, SSR hydration), the component unmounts immediately instead of waiting 1s for the fallback timer. Production behavior with CSS animations/transitions is unchanged.

---

**🐛 Select, Tooltip, Popover — forceMount presence coordination**

Portal now shares a `usePresence` instance created at Root level. This fixes a bug where Portal would unmount on `isOpen=false` before the Content's CSS exit animation could complete.

- **Before:** Portal checked `!api.isOpen` → immediate unmount, cutting exit animations short.
- **After:** Portal checks `!isPresent` (managed by `watchPresence`) → stays mounted until `animationend`/`transitionend`, then unmounts.

---

**📦 Bundle optimization (React + Vue)**

- `"sideEffects": false` added to all 14 packages — enables aggressive tree-shaking in webpack/Rollup/Vite.
- **Subpath exports** on `@forge-ui/react` and `@forge-ui/vue`: `"./dialog"`, `"./select"`, `"./combobox"`, `"./tooltip"`, `"./popover"`, `"./checkbox"`, `"./switch"`, `"./field"`, `"./hover-card"`, `"./tags-input"`.
- Multi-entry build with `--splitting`: shared chunks between subpaths, no code duplication.
- Minified ESM output.

```ts
// Import only what you need — no full bundle
import { Dialog } from "@forge-ui/react/dialog";
import { Select } from "@forge-ui/react/select";
```
