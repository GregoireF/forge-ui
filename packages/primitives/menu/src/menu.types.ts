import type { Placement } from "@floating-ui/dom";
import type { FloatingPositioning, ResolvedFloatingPositioning } from "@forge-ui/floating";

export type { FloatingPositioning as MenuPositioning };

// ---------------------------------------------------------------------------
// Item
// ---------------------------------------------------------------------------

export interface MenuItem {
  value: string;
  label: string;
  /**
   * Text used for typeahead matching — falls back to `label` when omitted.
   * Provide when the rendered children differ from the label (e.g. icon + text).
   */
  textValue?: string;
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export interface MenuContext {
  id: string;
  items: MenuItem[];
  highlighted: string | null;
  /** Whether the last highlight change was from keyboard or pointer.
   *  Consumed by frameworks to decide whether to move real DOM focus to the item. */
  highlightSource: "pointer" | "keyboard";
  isContextMenu: boolean;
  contextMenuX: number;
  contextMenuY: number;
  /** Whether arrow-key navigation wraps at list ends. @default true */
  loop: boolean;
  /**
   * When true: sets `aria-modal` on content; framework renders a transparent overlay
   * to block pointer-events on the rest of the page while the menu is open.
   * Matches Radix/Ark/Reka default. Set false for inline/non-modal menus.
   * @default true
   */
  modal: boolean;
  // Floating
  x: number;
  y: number;
  positioned: boolean;
  currentPlacement: Placement;
  positioning: ResolvedFloatingPositioning;
  // DOM refs
  contentEl: HTMLElement | null;
  arrowEl: Element | null;
  triggerEl: HTMLElement | null;
  /** Optional anchor override. When set, the positioner uses this element as
   *  the floating reference instead of triggerEl. Cleared when Anchor unmounts. */
  anchorEl: HTMLElement | null;
  // IDs
  triggerId: string;
  contentId: string;
  // Callbacks
  onOpenChange?: (open: boolean) => void;
  onSelect?: (value: string) => void;
  onHighlightChange?: (value: string | null) => void;
  onInteractOutside?: (e: PointerEvent | FocusEvent) => void;
  onPointerDownOutside?: (e: PointerEvent) => void;
  onFocusOutside?: (e: FocusEvent) => void;
  onEscapeKeyDown?: (e: { key: string; defaultPrevented: boolean; preventDefault(): void }) => void;
}

// ---------------------------------------------------------------------------
// State / Event / Send
// ---------------------------------------------------------------------------

export type MenuState = "closed" | "open";

export type MenuEvent =
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "TOGGLE" }
  | { type: "CONTEXT_MENU"; x: number; y: number }
  | { type: "ESCAPE_KEY" }
  | { type: "INTERACT_OUTSIDE" }
  | { type: "HIGHLIGHT_ITEM"; value: string | null; source?: "pointer" | "keyboard" }
  | { type: "NEXT_ITEM" }
  | { type: "PREV_ITEM" }
  | { type: "FIRST_ITEM" }
  | { type: "LAST_ITEM" }
  | { type: "SELECT_ITEM"; value: string }
  | { type: "SELECT_HIGHLIGHTED" }
  | { type: "REGISTER_ITEM"; item: MenuItem }
  | { type: "UNREGISTER_ITEM"; value: string }
  | { type: "@@INIT" };

export type MenuSend = (event: MenuEvent | MenuEvent["type"]) => void;

export interface KeyEventLike {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  defaultPrevented: boolean;
  preventDefault(): void;
  stopPropagation(): void;
}
