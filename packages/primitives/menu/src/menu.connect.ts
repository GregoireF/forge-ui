import type { MachineInstance, MachineSnapshot } from "@forge-ui/core";
import { updateLayerContentEl } from "@forge-ui/core";
import {
  getAlignFromPlacement,
  getSideFromPlacement,
  getTransformOrigin,
} from "@forge-ui/floating";
import type { KeyEventLike, MenuContext, MenuEvent, MenuItem, MenuSend, MenuState } from "./menu.types.js";

export type MenuApi = ReturnType<typeof connectMenu>;

function sanitizeId(value: string): string {
  return value.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9_-]/g, "");
}

export function getItemId(menuId: string, value: string): string {
  return `${menuId}-item-${sanitizeId(value)}`;
}

// ---------------------------------------------------------------------------
// Typeahead
// ---------------------------------------------------------------------------

function createTypeahead(
  getItems: () => MenuItem[],
  getCurrent: () => string | null,
  onMatch: (value: string) => void,
) {
  let buffer = "";
  let timerId: ReturnType<typeof setTimeout> | undefined;

  function flush() { buffer = ""; timerId = undefined; }

  function handleChar(char: string) {
    if (timerId !== undefined) clearTimeout(timerId);
    buffer += char.toLowerCase();
    timerId = setTimeout(flush, 500);

    const items = getItems().filter((i) => !i.disabled);
    if (items.length === 0) return;

    // Use textValue when provided (allows icon + text items to typeahead on text only).
    const matches = items.filter((i) => (i.textValue ?? i.label).toLowerCase().startsWith(buffer));
    if (matches.length === 0) return;

    const current = getCurrent();
    if (matches.length > 1) {
      const idx = matches.findIndex((i) => i.value === current);
      if (idx !== -1) {
        const next = matches[(idx + 1) % matches.length];
        if (next) onMatch(next.value);
        return;
      }
    }
    const first = matches[0];
    if (first) onMatch(first.value);
  }

  return { handleChar };
}

// ---------------------------------------------------------------------------
// Connect
// ---------------------------------------------------------------------------

export function connectMenu(
  snapshot: MachineSnapshot<MenuContext, MenuState>,
  send: MenuSend,
  machine: Pick<MachineInstance<MenuContext, MenuState, MenuEvent>, "setContext">,
) {
  const { context } = snapshot;
  const isOpen = snapshot.matches("open");
  const state = isOpen ? "open" : "closed";
  const side = getSideFromPlacement(context.currentPlacement);
  const align = getAlignFromPlacement(context.currentPlacement);

  const typeahead = createTypeahead(
    () => context.items,
    () => context.highlighted,
    (value) => send({ type: "HIGHLIGHT_ITEM", value, source: "keyboard" }),
  );

  // ---------------------------------------------------------------------------
  // Keyboard handlers
  // ---------------------------------------------------------------------------

  function contentKeyDown(event: KeyEventLike) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        send("NEXT_ITEM");
        break;
      case "ArrowUp":
        event.preventDefault();
        send("PREV_ITEM");
        break;
      case "Home":
        event.preventDefault();
        send("FIRST_ITEM");
        break;
      case "End":
        event.preventDefault();
        send("LAST_ITEM");
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (context.highlighted !== null) send("SELECT_HIGHLIGHTED");
        break;
      case "Escape": {
        context.onEscapeKeyDown?.(event);
        if (!event.defaultPrevented) {
          event.preventDefault();
          event.stopPropagation();
          send("ESCAPE_KEY");
        }
        break;
      }
      case "Tab":
        send("CLOSE");
        break;
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
          typeahead.handleChar(event.key);
        }
    }
  }

  function triggerKeyDown(event: KeyEventLike) {
    switch (event.key) {
      case "ArrowDown":
      case "Enter":
      case " ":
        event.preventDefault();
        if (!isOpen) send("OPEN");
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!isOpen) {
          send("OPEN");
          // Request last-item highlight after items have mounted.
          // Justification: items may not be registered yet at OPEN time (first render).
          // setTimeout(0) ensures this runs in the next macrotask, after useLayoutEffect
          // registration and useEffect FIRST_ITEM both complete.
          setTimeout(() => send("LAST_ITEM"), 0);
        }
        break;
      case "Escape":
        if (isOpen) {
          event.preventDefault();
          send("ESCAPE_KEY");
        }
        break;
    }
  }

  // ---------------------------------------------------------------------------
  // API
  // ---------------------------------------------------------------------------

  return {
    isOpen,
    modal: context.modal,
    highlightSource: context.highlightSource,

    focusContent() { context.contentEl?.focus(); },
    focusTrigger() { context.triggerEl?.focus(); },
    focusHighlightedItem() {
      if (!context.highlighted || !context.contentEl) return;
      const id = getItemId(context.id, context.highlighted);
      const el = context.contentEl.querySelector(`#${CSS.escape(id)}`) as HTMLElement | null;
      el?.focus({ preventScroll: true });
    },

    send,
    setContext: machine.setContext,

    // ── Trigger ────────────────────────────────────────────────────────────

    getTriggerProps({ disabled = false }: { disabled?: boolean } = {}) {
      return {
        id: context.triggerId,
        type: "button" as const,
        "aria-haspopup": "menu" as const,
        "aria-expanded": isOpen,
        "aria-controls": isOpen ? context.contentId : undefined,
        "data-state": state,
        "data-forge-scope": "menu",
        "data-forge-part": "trigger",
        // Native `disabled` blocks all pointer/keyboard events — use aria-disabled for
        // items that should still receive focus but not activate. Trigger uses native
        // disabled (button element) so no focus-while-disabled needed.
        disabled: disabled || undefined,
        "aria-disabled": disabled || undefined,
        "data-disabled": disabled ? "" : undefined,
        ref: (el: unknown) => machine.setContext({ triggerEl: el as HTMLElement | null }),
        onClick() { if (!disabled) send("TOGGLE"); },
        onKeyDown: disabled ? undefined : triggerKeyDown,
        onKeydown: disabled ? undefined : triggerKeyDown,
      };
    },

    getContextMenuTriggerProps() {
      return {
        "data-forge-scope": "menu",
        "data-forge-part": "context-menu-trigger",
        ref: (el: unknown) => machine.setContext({ triggerEl: el as HTMLElement | null }),
        onContextMenu(event: { clientX: number; clientY: number; preventDefault(): void }) {
          event.preventDefault();
          send({ type: "CONTEXT_MENU", x: event.clientX, y: event.clientY });
        },
      };
    },

    // ── Positioner ─────────────────────────────────────────────────────────

    getPositionerProps() {
      if (context.isContextMenu) {
        return {
          style: {
            position: "fixed" as const,
            top: `${context.contextMenuY}px`,
            left: `${context.contextMenuX}px`,
            // z-index 50 ensures positioner is above modal overlay (z-index 49).
            zIndex: 50,
          },
          "data-forge-scope": "menu",
          "data-forge-part": "positioner",
        };
      }
      return {
        style: {
          position: context.positioning.strategy,
          top: `${context.y}px`,
          left: `${context.x}px`,
          width: "max-content",
          opacity: "var(--forge-revealed, 0)" as unknown as number,
          zIndex: 50,
          ...(!context.positioned && { pointerEvents: "none" as const }),
        },
        "data-forge-scope": "menu",
        "data-forge-part": "positioner",
        "data-side": side,
        "data-align": align,
        "data-placement": context.currentPlacement,
      };
    },

    // ── Content ────────────────────────────────────────────────────────────

    getContentProps() {
      return {
        id: context.contentId,
        role: "menu" as const,
        tabIndex: -1,
        // aria-modal: tells screen readers to restrict the virtual cursor to this element.
        // Without it, JAWS/NVDA users can navigate out of the menu while it's open.
        // Justification: WCAG 4.1.2 — only meaningful when modal=true (default).
        "aria-modal": context.modal || undefined,
        "data-state": state,
        "data-side": context.isContextMenu ? undefined : side,
        "data-align": context.isContextMenu ? undefined : align,
        "data-forge-scope": "menu",
        "data-forge-part": "content",
        ref: (el: unknown) => {
          const htmlEl = el as HTMLElement | null;
          machine.setContext({ contentEl: htmlEl });
          updateLayerContentEl(context.id, htmlEl);
          if (htmlEl && !context.isContextMenu) {
            htmlEl.style.setProperty(
              "--forge-menu-transform-origin",
              getTransformOrigin(context.currentPlacement),
            );
          }
        },
        onKeyDown: contentKeyDown,
        onKeydown: contentKeyDown,
      };
    },

    // ── Arrow ──────────────────────────────────────────────────────────────

    getArrowProps() {
      return {
        "data-forge-scope": "menu",
        "data-forge-part": "arrow",
        "data-side": side,
        ref: (el: unknown) => machine.setContext({ arrowEl: el as Element | null }),
      };
    },

    getArrowTipProps() {
      return {
        "data-forge-scope": "menu",
        "data-forge-part": "arrow-tip",
      };
    },

    // ── Anchor ─────────────────────────────────────────────────────────────
    // An optional positioning anchor. When mounted, the positioner uses this
    // element as the floating reference instead of the trigger (anchorEl ?? triggerEl).

    getAnchorProps() {
      return {
        "data-forge-scope": "menu",
        "data-forge-part": "anchor",
        ref: (el: unknown) => machine.setContext({ anchorEl: el as HTMLElement | null }),
      };
    },

    // ── Item ───────────────────────────────────────────────────────────────

    getItemProps(value: string, disabled = false) {
      const isHighlighted = context.highlighted === value;
      return {
        id: getItemId(context.id, value),
        role: "menuitem" as const,
        // tabIndex 0 on the highlighted item mirrors the Radix/WAI-ARIA "roving tabindex" pattern,
        // allowing real DOM focus to land on the item via keyboard nav. Still -1 for non-highlighted
        // so Tab key skips items (Tab closes the menu instead).
        tabIndex: isHighlighted ? 0 : -1,
        "aria-disabled": disabled || undefined,
        "data-highlighted": isHighlighted ? "" : undefined,
        "data-disabled": disabled ? "" : undefined,
        "data-forge-scope": "menu",
        "data-forge-part": "item",
        onMouseEnter() { if (!disabled) send({ type: "HIGHLIGHT_ITEM", value }); },
        onMouseLeave() { send({ type: "HIGHLIGHT_ITEM", value: null }); },
        onMousemove() { if (!disabled) send({ type: "HIGHLIGHT_ITEM", value }); },
        onMouseleave() { send({ type: "HIGHLIGHT_ITEM", value: null }); },
        onClick() { if (!disabled) send({ type: "SELECT_ITEM", value }); },
      };
    },

    // ── RadioGroup ─────────────────────────────────────────────────────────

    getRadioGroupProps(groupId: string) {
      return {
        role: "group" as const,
        "data-forge-scope": "menu",
        "data-forge-part": "radio-group",
        ...(groupId && { "aria-labelledby": `${context.id}-rg-label-${sanitizeId(groupId)}` }),
      };
    },

    getRadioGroupLabelProps(groupId: string) {
      return {
        id: `${context.id}-rg-label-${sanitizeId(groupId)}`,
        role: "presentation" as const,
        "data-forge-scope": "menu",
        "data-forge-part": "radio-group-label",
      };
    },

    getRadioItemProps({
      value,
      checked,
      disabled = false,
      closeOnSelect = true,
    }: {
      value: string;
      checked: boolean;
      disabled?: boolean;
      closeOnSelect?: boolean;
    }) {
      const isHighlighted = context.highlighted === value;
      return {
        id: getItemId(context.id, value),
        role: "menuitemradio" as const,
        tabIndex: isHighlighted ? 0 : -1,
        "aria-checked": checked,
        "aria-disabled": disabled || undefined,
        "data-highlighted": isHighlighted ? "" : undefined,
        "data-disabled": disabled ? "" : undefined,
        "data-state": checked ? "checked" : ("unchecked" as const),
        "data-forge-scope": "menu",
        "data-forge-part": "radio-item",
        onMouseEnter() { if (!disabled) send({ type: "HIGHLIGHT_ITEM", value }); },
        onMouseLeave() { send({ type: "HIGHLIGHT_ITEM", value: null }); },
        onMousemove() { if (!disabled) send({ type: "HIGHLIGHT_ITEM", value }); },
        onMouseleave() { send({ type: "HIGHLIGHT_ITEM", value: null }); },
        onClick() {
          if (!disabled && closeOnSelect) send({ type: "SELECT_ITEM", value });
        },
      };
    },

    // ── CheckboxItem ───────────────────────────────────────────────────────

    getCheckboxItemProps({
      value,
      checked,
      disabled = false,
      closeOnSelect = false,
    }: {
      value: string;
      checked: boolean | "indeterminate";
      disabled?: boolean;
      closeOnSelect?: boolean;
    }) {
      const isHighlighted = context.highlighted === value;
      const ariaChecked = checked === "indeterminate" ? "mixed" as const : checked;
      return {
        id: getItemId(context.id, value),
        role: "menuitemcheckbox" as const,
        tabIndex: isHighlighted ? 0 : -1,
        "aria-checked": ariaChecked,
        "aria-disabled": disabled || undefined,
        "data-highlighted": isHighlighted ? "" : undefined,
        "data-disabled": disabled ? "" : undefined,
        "data-state": checked === "indeterminate" ? "indeterminate" : checked ? "checked" : ("unchecked" as const),
        "data-forge-scope": "menu",
        "data-forge-part": "checkbox-item",
        onMouseEnter() { if (!disabled) send({ type: "HIGHLIGHT_ITEM", value }); },
        onMouseLeave() { send({ type: "HIGHLIGHT_ITEM", value: null }); },
        onMousemove() { if (!disabled) send({ type: "HIGHLIGHT_ITEM", value }); },
        onMouseleave() { send({ type: "HIGHLIGHT_ITEM", value: null }); },
        onClick() {
          if (!disabled && closeOnSelect) send({ type: "SELECT_ITEM", value });
        },
      };
    },

    // ── ItemIndicator ──────────────────────────────────────────────────────

    getItemIndicatorProps(checked: boolean | "indeterminate") {
      return {
        "data-state": checked === "indeterminate" ? "indeterminate" : checked ? "checked" : ("unchecked" as const),
        "data-forge-scope": "menu",
        "data-forge-part": "item-indicator",
      };
    },

    // ── SubTrigger ─────────────────────────────────────────────────────────

    getSubTriggerProps(subMenuId: string, subIsOpen: boolean, disabled = false) {
      const isHighlighted = context.highlighted === subMenuId;
      return {
        id: getItemId(context.id, subMenuId),
        role: "menuitem" as const,
        tabIndex: isHighlighted ? 0 : -1,
        "aria-haspopup": "menu" as const,
        "aria-expanded": subIsOpen,
        "aria-controls": subIsOpen ? `${subMenuId}-content` : undefined,
        "aria-disabled": disabled || undefined,
        "data-highlighted": isHighlighted ? "" : undefined,
        "data-state": subIsOpen ? "open" : ("closed" as const),
        "data-disabled": disabled ? "" : undefined,
        "data-forge-scope": "menu",
        "data-forge-part": "sub-trigger",
        onMouseEnter() { if (!disabled) send({ type: "HIGHLIGHT_ITEM", value: subMenuId }); },
        onMousemove() { if (!disabled) send({ type: "HIGHLIGHT_ITEM", value: subMenuId }); },
        onMouseLeave() { send({ type: "HIGHLIGHT_ITEM", value: null }); },
        onMouseleave() { send({ type: "HIGHLIGHT_ITEM", value: null }); },
      };
    },

    // ── Label ──────────────────────────────────────────────────────────────

    getLabelProps() {
      return {
        role: "none" as const,
        "data-forge-scope": "menu",
        "data-forge-part": "label",
      };
    },

    // ── Separator / Group ──────────────────────────────────────────────────

    getSeparatorProps() {
      return {
        role: "separator" as const,
        "aria-orientation": "horizontal" as const,
        "data-forge-scope": "menu",
        "data-forge-part": "separator",
      };
    },

    getGroupProps(groupId: string) {
      return {
        role: "group" as const,
        "aria-labelledby": groupId,
        "data-forge-scope": "menu",
        "data-forge-part": "group",
      };
    },

    getGroupLabelProps(groupId: string) {
      return {
        id: groupId,
        role: "presentation" as const,
        "data-forge-scope": "menu",
        "data-forge-part": "group-label",
      };
    },
  };
}
