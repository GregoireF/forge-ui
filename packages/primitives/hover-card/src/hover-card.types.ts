import type { Placement } from "@floating-ui/dom";
import type { FloatingPositioning, ResolvedFloatingPositioning } from "@forge-ui/floating";

export type HoverCardPositioning = FloatingPositioning;

export interface HoverCardContext {
  id: string;
  openDelay: number;
  closeDelay: number;
  isOpen: boolean;
  triggerId: string;
  contentId: string;
  currentPlacement: Placement;
  positioning: ResolvedFloatingPositioning;
  onOpenChange?: (open: boolean) => void;
  // FloatingContext-compatible fields required by makeComputePositionActivity
  triggerEl: HTMLElement | null;
  contentEl: HTMLElement | null;
  arrowEl: HTMLElement | null;
  x: number;
  y: number;
  positioned: boolean;
  // Internal timer IDs stored as mutable context (same pattern as Tooltip)
  _openTimerId: ReturnType<typeof setTimeout> | undefined;
  _closeTimerId: ReturnType<typeof setTimeout> | undefined;
}

export type HoverCardState = "idle" | "opening" | "open" | "closing";

export type HoverCardEvent =
  | { type: "MOUSE_ENTER" }
  | { type: "MOUSE_LEAVE" }
  | { type: "FOCUS" }
  | { type: "BLUR" }
  | { type: "OPEN_TIMEOUT" }
  | { type: "CLOSE_TIMEOUT" };

export type HoverCardSend = (event: HoverCardEvent) => void;
