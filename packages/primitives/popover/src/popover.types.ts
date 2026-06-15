import type { Middleware, Placement, Strategy } from "@floating-ui/dom";

// ---------------------------------------------------------------------------
// Positioning
// ---------------------------------------------------------------------------

export interface PopoverPositioning {
  /** Placement relative to the reference (anchor). Default: "bottom". */
  placement?: Placement;
  /** "fixed" (default, safe for portaled content) or "absolute". */
  strategy?: Strategy;
  /** Distance between anchor and floating in px. Default: 4. */
  offset?: number;
  /** Extra @floating-ui/dom middleware to inject after built-in ones. */
  middleware?: Middleware[];
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export interface PopoverContext {
  id: string;
  open: boolean;
  /** Modal: trapFocus + hideOthers (no lockScroll by default). */
  modal: boolean;
  trapFocus: boolean;
  preventScroll: boolean;
  hideOthers: boolean;
  /** IDs */
  triggerId: string;
  contentId: string;
  titleId: string;
  descriptionId: string;
  /** Presence registration */
  titleRegistered: boolean;
  descriptionRegistered: boolean;
  /** DOM refs */
  triggerEl: HTMLElement | null;
  /** Anchor element — defaults to triggerEl if not provided. */
  anchorEl: HTMLElement | null;
  contentEl: HTMLElement | null;
  arrowEl: HTMLElement | null;
  /** Computed position (updated by makeComputePositionActivity). */
  x: number;
  y: number;
  /** Resolved placement after flip/shift (may differ from positioning.placement). */
  currentPlacement: Placement;
  /** Positioning options snapshot (read by activity, set at machine creation). */
  positioning: Required<Omit<PopoverPositioning, "middleware">> & {
    middleware?: PopoverPositioning["middleware"];
  };
  /** User-provided focus / outside callbacks — same shape as Dialog. */
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
