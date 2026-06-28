# @forge-ui/menu

Headless, accessible Menu primitive — WAI-ARIA Menu Button pattern + Context Menu.

## Features

- **DropdownMenu** (trigger → content) and **ContextMenu** (right-click → positioned at cursor)
- N-level **sub-menu** nesting (unlimited depth)
- **Radio items** and **checkbox items** with indicators
- **Typeahead** — type to jump to matching item
- **Roving tabindex** — real DOM focus on highlighted item (keyboard-driven)
- `highlightSource: "pointer" | "keyboard"` — frameworks only focus on keyboard nav
- **RTL** support on sub-menu open direction
- **`asChild`** — merge props onto your own element
- **`Menu.Anchor`** — position the menu relative to an arbitrary element
- **`openOnHover`** — disable hover-open on sub-triggers (click-only mode)
- **`navigate`** — router navigation after item selection
- **`onCloseAutoFocus`** — restore focus after close
- Full **modal** (overlay + aria-modal) or non-modal mode

---

## Machine API (`@forge-ui/menu`)

### `createMenuMachine(options)`

| Option | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | required | Unique machine id |
| `defaultOpen` | `boolean` | `false` | Uncontrolled initial open state |
| `open` | `boolean` | — | Controlled open state |
| `loop` | `boolean` | `true` | Arrow key navigation wraps at list ends |
| `modal` | `boolean` | `true` | aria-modal + pointer overlay |
| `isContextMenu` | `boolean` | `false` | Context menu mode (cursor positioning) |
| `positioning` | `FloatingPositioning` | — | Floating-UI placement options |
| `onOpenChange` | `(open: boolean) => void` | — | Open state changed |
| `onSelect` | `(value: string) => void` | — | Item selected |
| `onHighlightChange` | `(value: string \| null) => void` | — | Highlight changed |
| `onInteractOutside` | `(e) => void` | — | Pointer/focus outside |
| `onEscapeKeyDown` | `(e) => void` | — | Escape pressed (can preventDefault) |

### `connectMenu(snapshot, send, machine)`

Returns prop-getter functions for every part:

| Method | Description |
|---|---|
| `getTriggerProps({ disabled? })` | Button that opens/closes the menu |
| `getContextMenuTriggerProps()` | Wrapper for right-click context menu |
| `getPositionerProps()` | Absolute/fixed positioner div |
| `getContentProps()` | `role="menu"` content div |
| `getArrowProps()` | Arrow span |
| `getAnchorProps()` | Optional positioning anchor element |
| `getItemProps(value, disabled?)` | `role="menuitem"` |
| `getRadioGroupProps(groupId)` | Radio group container |
| `getRadioItemProps({ value, checked, disabled?, closeOnSelect? })` | `role="menuitemradio"` |
| `getCheckboxItemProps({ value, checked, disabled?, closeOnSelect? })` | `role="menuitemcheckbox"` |
| `getItemIndicatorProps(checked)` | Checkmark/radio indicator |
| `getSubTriggerProps(subMenuId, subIsOpen, disabled?)` | Sub-menu trigger |
| `getLabelProps()` | Visual label (`role="none"`) |
| `getSeparatorProps()` | `role="separator"` |
| `getGroupProps(groupId)` | `role="group"` |
| `getGroupLabelProps(groupId)` | Group label |

---

## React

### DropdownMenu — basic usage

```tsx
import { Menu } from "@forge-ui/react";

function MyMenu() {
  return (
    <Menu.Root onSelect={(v) => console.log(v)}>
      <Menu.Trigger>Actions ▾</Menu.Trigger>
      <Menu.Portal>
        <Menu.Content>
          <Menu.Item value="new">Nouveau fichier</Menu.Item>
          <Menu.Item value="open">Ouvrir…</Menu.Item>
          <Menu.Separator />
          <Menu.Item value="delete" disabled>Supprimer</Menu.Item>
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  );
}
```

### Groups, Labels

```tsx
<Menu.Group id="edit">
  <Menu.GroupLabel groupId="edit">Édition</Menu.GroupLabel>
  <Menu.Item value="cut">Couper</Menu.Item>
  <Menu.Item value="copy">Copier</Menu.Item>
</Menu.Group>
```

### Radio items

```tsx
const [theme, setTheme] = useState("system");

<Menu.RadioGroup groupId="theme" value={theme} onValueChange={setTheme}>
  {["light", "dark", "system"].map((t) => (
    <Menu.RadioItem key={t} value={t} closeOnSelect={false}>
      <Menu.ItemIndicator>✓</Menu.ItemIndicator>
      {t}
    </Menu.RadioItem>
  ))}
</Menu.RadioGroup>
```

### Checkbox items

```tsx
const [showGrid, setShowGrid] = useState(false);

<Menu.CheckboxItem value="grid" checked={showGrid} onCheckedChange={setShowGrid}>
  <Menu.ItemIndicator>✓</Menu.ItemIndicator>
  Grille
</Menu.CheckboxItem>
```

### Sub-menus (N-level)

```tsx
<Menu.Sub>
  <Menu.SubTrigger value="share">Partager ▶</Menu.SubTrigger>
  <Menu.SubContent>
    <Menu.Item value="link">Lien</Menu.Item>
    <Menu.Sub>
      <Menu.SubTrigger value="social">Réseaux ▶</Menu.SubTrigger>
      <Menu.SubContent>
        <Menu.Item value="twitter">Twitter</Menu.Item>
        <Menu.Item value="linkedin">LinkedIn</Menu.Item>
      </Menu.SubContent>
    </Menu.Sub>
  </Menu.SubContent>
</Menu.Sub>
```

### Sub-menu click-only (no hover)

```tsx
<Menu.Sub>
  {/* openOnHover={false} — hover only highlights, click opens */}
  <Menu.SubTrigger value="share" openOnHover={false}>Partager ▶</Menu.SubTrigger>
  <Menu.SubContent>
    <Menu.Item value="link">Lien</Menu.Item>
  </Menu.SubContent>
</Menu.Sub>
```

### navigate prop (router integration)

```tsx
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();

<Menu.Item value="profile" navigate={() => navigate("/profile")}>
  Mon profil
</Menu.Item>
```

### Menu.Anchor (position relative to a custom element)

```tsx
<Menu.Root>
  {/* Menu will be positioned relative to this anchor, not the trigger */}
  <Menu.Anchor asChild>
    <div ref={myRef} style={{ width: 200, height: 40 }} />
  </Menu.Anchor>
  <Menu.Trigger>Ouvrir</Menu.Trigger>
  <Menu.Portal>
    <Menu.Content>
      <Menu.Item value="a">Option A</Menu.Item>
    </Menu.Content>
  </Menu.Portal>
</Menu.Root>
```

### ContextMenu

```tsx
import { ContextMenu } from "@forge-ui/react";

<ContextMenu.Root onSelect={(v) => console.log(v)}>
  <ContextMenu.Trigger>
    <div style={{ width: 200, height: 80, background: "#1e40af" }}>
      Clic-droit ici
    </div>
  </ContextMenu.Trigger>
  <ContextMenu.Portal>
    <ContextMenu.Content>
      <ContextMenu.Item value="inspect">Inspecter</ContextMenu.Item>
      <ContextMenu.Separator />
      <ContextMenu.CheckboxItem value="bk" checked={bk} onCheckedChange={setBk}>
        <ContextMenu.ItemIndicator>★</ContextMenu.ItemIndicator>
        Marquer
      </ContextMenu.CheckboxItem>
      <ContextMenu.Separator />
      <ContextMenu.Sub>
        <ContextMenu.SubTrigger value="share">Partager ▶</ContextMenu.SubTrigger>
        <ContextMenu.SubContent>
          <ContextMenu.Item value="link">Lien</ContextMenu.Item>
        </ContextMenu.SubContent>
      </ContextMenu.Sub>
    </ContextMenu.Content>
  </ContextMenu.Portal>
</ContextMenu.Root>
```

---

## Vue

### DropdownMenu

```vue
<script setup>
import { Menu } from "@forge-ui/vue";
const onSelect = (v) => console.log(v);
</script>

<template>
  <Menu.Root :on-select="onSelect">
    <Menu.Trigger>Actions ▾</Menu.Trigger>
    <Menu.Portal>
      <Menu.Content>
        <Menu.Item value="new">Nouveau fichier</Menu.Item>
        <Menu.Item value="open">Ouvrir…</Menu.Item>
        <Menu.Separator />
        <Menu.Sub>
          <Menu.SubTrigger value="share">Partager ▶</Menu.SubTrigger>
          <Menu.SubContent>
            <Menu.Item value="link">Lien</Menu.Item>
          </Menu.SubContent>
        </Menu.Sub>
      </Menu.Content>
    </Menu.Portal>
  </Menu.Root>
</template>
```

### ContextMenu

```vue
<script setup>
import { ContextMenu } from "@forge-ui/vue";
</script>

<template>
  <ContextMenu.Root>
    <ContextMenu.Trigger>
      <div>Clic-droit ici</div>
    </ContextMenu.Trigger>
    <ContextMenu.Portal>
      <ContextMenu.Content>
        <ContextMenu.Item value="inspect">Inspecter</ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Sub>
          <ContextMenu.SubTrigger value="share">Partager ▶</ContextMenu.SubTrigger>
          <ContextMenu.SubContent>
            <ContextMenu.Item value="link">Lien</ContextMenu.Item>
          </ContextMenu.SubContent>
        </ContextMenu.Sub>
      </ContextMenu.Content>
    </ContextMenu.Portal>
  </ContextMenu.Root>
</template>
```

---

## Data attributes

| Attribute | Values | Description |
|---|---|---|
| `data-state` | `open` \| `closed` | Menu / sub-menu open state |
| `data-highlighted` | `""` | Present on the highlighted item |
| `data-disabled` | `""` | Present on disabled items |
| `data-side` | `top` \| `bottom` \| `left` \| `right` | Placement side |
| `data-align` | `start` \| `center` \| `end` | Placement alignment |
| `data-forge-scope` | `menu` | Scope identifier for all parts |
| `data-forge-part` | `trigger` \| `content` \| `item` \| `separator` \| … | Part identifier |

---

## ARIA

The Menu implements the [WAI-ARIA Menu Button Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/).

- `role="menu"` on content
- `role="menuitem"` / `role="menuitemradio"` / `role="menuitemcheckbox"` on items
- `aria-haspopup="menu"` on trigger and sub-triggers
- `aria-expanded` reflects open state
- `aria-modal="true"` when modal (default)
- Roving `tabIndex` — highlighted item gets `tabIndex=0`, all others `-1`
- Real DOM focus moves to highlighted item on keyboard navigation (no `aria-activedescendant`)

## Keyboard

| Key | Action |
|---|---|
| `Enter` / `Space` | Open menu (trigger) / Select highlighted item (content) |
| `ArrowDown` / `ArrowUp` | Navigate items |
| `Home` / `End` | First / last item |
| `ArrowRight` | Open sub-menu (when sub-trigger highlighted) |
| `ArrowLeft` | Close sub-menu (from sub-content) |
| `Escape` | Close menu, return focus to trigger |
| `Tab` | Close menu |
| Any printable char | Typeahead — jump to matching item |
