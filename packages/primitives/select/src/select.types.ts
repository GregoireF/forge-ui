import type { Placement } from "@floating-ui/dom";
import type { FloatingPositioning, ResolvedFloatingPositioning } from "@forge-ui/floating";

// Re-export for consumers who import from @forge-ui/select directly.
export type { FloatingPositioning as SelectPositioning };

// ---------------------------------------------------------------------------
// Option
// ---------------------------------------------------------------------------

export interface SelectOption {
  value: string;
  label: string;
  disabled: boolean;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export interface SelectContext {
  id: string;
  /** Allow multiple selection. Default: false. */
  multiple: boolean;
  /** Currently selected values. Always an array — single-select is max length 1. */
  value: string[];
  /** The option value currently highlighted via keyboard / hover. */
  highlighted: string | null;
  /** Registered options in render order (cleared on item unmount). */
  options: SelectOption[];
  /** Persistent label map — survives close/unmount so valueLabel stays valid. */
  valueLabelMap: Record<string, string>;
  /** Placeholder text shown when no value is selected. */
  placeholder: string;
  /** Disable the entire select. */
  disabled: boolean;
  // Floating positioning
  x: number;
  y: number;
  positioned: boolean;
  currentPlacement: Placement;
  positioning: ResolvedFloatingPositioning;
  // IDs
  triggerId: string;
  contentId: string;
  labelId: string;
  // DOM refs
  triggerEl: HTMLElement | null;
  contentEl: HTMLElement | null;
  /** Required by FloatingContext — Select has no arrow, always null. */
  arrowEl: Element | null;
  // Callbacks
  onValueChange?: (value: string[]) => void;
  onOpenChange?: (open: boolean) => void;
  onHighlightChange?: (value: string | null) => void;
}

export type SelectState = "closed" | "open";

export type SelectEvent =
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "TOGGLE" }
  | { type: "ESCAPE_KEY" }
  | { type: "INTERACT_OUTSIDE" }
  /** Select a specific option by value. */
  | { type: "SELECT_OPTION"; value: string }
  /** Select the currently highlighted option. */
  | { type: "SELECT_HIGHLIGHTED" }
  /** Set highlighted option explicitly (null = clear). */
  | { type: "HIGHLIGHT_OPTION"; value: string | null }
  | { type: "HIGHLIGHT_NEXT" }
  | { type: "HIGHLIGHT_PREV" }
  | { type: "HIGHLIGHT_FIRST" }
  | { type: "HIGHLIGHT_LAST" }
  /** Register an option (called by compound Select.Option on mount). */
  | { type: "REGISTER_OPTION"; option: SelectOption }
  /** Unregister an option (called by compound Select.Option on unmount). */
  | { type: "UNREGISTER_OPTION"; value: string }
  | { type: "@@INIT" };

export type SelectSend = (event: SelectEvent | SelectEvent["type"]) => void;

/** Minimal keyboard event interface — compatible with DOM KeyboardEvent and React synthetic events. */
export interface KeyEventLike {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  preventDefault(): void;
}
