import type { Placement } from "@floating-ui/dom";
import type { FloatingPositioning, ResolvedFloatingPositioning } from "@forge-ui/floating";

export type { FloatingPositioning as TooltipPositioning };

export interface TooltipContext {
  id: string;
  open: boolean;
  disabled: boolean;
  interactive: boolean;
  closeOnPointerDown: boolean;
  openDelay: number;
  closeDelay: number;
  contentId: string;
  triggerEl: HTMLElement | null;
  contentEl: HTMLElement | null;
  arrowEl: HTMLElement | null;
  anchorEl?: HTMLElement | null;
  x: number;
  y: number;
  positioned: boolean;
  currentPlacement: Placement;
  positioning: ResolvedFloatingPositioning;
  onOpenChange?: (open: boolean) => void;
  /** Timer ID for scheduled open — stored in mutable context, managed by connect. */
  _openTimerId: ReturnType<typeof setTimeout> | undefined;
  /** Timer ID for scheduled close — stored in mutable context, managed by connect. */
  _closeTimerId: ReturnType<typeof setTimeout> | undefined;
  /** Provider callback: returns true if a previous tooltip closed recently (skip-delay). */
  _isInQuickSuccession?: () => boolean;
  /** Provider callback: called when this tooltip opens (updates lastClosedAt tracking). */
  _notifyOpen?: () => void;
  /** Provider callback: called when this tooltip closes (updates lastClosedAt tracking). */
  _notifyClose?: () => void;
}

export type TooltipState = "closed" | "open";

export type TooltipEvent = { type: "OPEN" } | { type: "CLOSE" };

export type TooltipSend = (event: TooltipEvent | TooltipEvent["type"]) => void;

// ---------------------------------------------------------------------------
// Provider context — resolved per Provider instance (not module-level).
// Using a per-instance ref for lastClosedAt is SSR-safe and supports multiple
// independent Provider groups on the same page.
// ---------------------------------------------------------------------------

export interface TooltipProviderContext {
  openDelay: number;
  closeDelay: number;
  skipDelay: number;
  interactive: boolean;
  isInQuickSuccession: () => boolean;
  notifyOpen: () => void;
  notifyClose: () => void;
}
