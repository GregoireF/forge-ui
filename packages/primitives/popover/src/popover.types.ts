import type { Placement } from "@floating-ui/dom";
import type { FloatingPositioning, ResolvedFloatingPositioning } from "@forge-ui/floating";

// Re-export for consumers who use @forge-ui/popover directly.
export type { FloatingPositioning as PopoverPositioning };

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export interface PopoverContext {
  id: string;
  open: boolean;
  modal: boolean;
  trapFocus: boolean;
  preventScroll: boolean;
  hideOthers: boolean;
  triggerId: string;
  contentId: string;
  titleId: string;
  descriptionId: string;
  titleRegistered: boolean;
  descriptionRegistered: boolean;
  triggerEl: HTMLElement | null;
  anchorEl: HTMLElement | null;
  contentEl: HTMLElement | null;
  arrowEl: Element | null;
  x: number;
  y: number;
  positioned: boolean;
  currentPlacement: Placement;
  positioning: ResolvedFloatingPositioning;
  initialFocusEl?: () => HTMLElement | null;
  finalFocusEl?: () => HTMLElement | null;
  onOpenAutoFocus?: (e: Event) => void;
  onCloseAutoFocus?: (e: Event) => void;
  onPointerDownOutside?: (e: PointerEvent) => void;
  onFocusOutside?: (e: FocusEvent) => void;
  onInteractOutside?: (e: PointerEvent | FocusEvent) => void;
  onEscapeKeyDown?: (e: KeyboardEvent) => void;
  onOpenChange?: (open: boolean) => void;
}

export type PopoverState = "closed" | "open";

export type PopoverEvent =
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "TOGGLE" }
  | { type: "ESCAPE_KEY" }
  | { type: "INTERACT_OUTSIDE" }
  | { type: "REGISTER_TITLE" }
  | { type: "UNREGISTER_TITLE" }
  | { type: "REGISTER_DESCRIPTION" }
  | { type: "UNREGISTER_DESCRIPTION" }
  | { type: "@@INIT" };

export type PopoverSend = (event: PopoverEvent | PopoverEvent["type"]) => void;
