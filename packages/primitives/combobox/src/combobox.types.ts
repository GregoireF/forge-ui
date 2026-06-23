import type { Placement } from "@floating-ui/dom";
import type { FloatingPositioning, ResolvedFloatingPositioning } from "@forge-ui/floating";

export interface ComboboxTranslations {
  /** Accessible label for the clear button. */
  clear: string;
  /** Accessible label for the toggle button when the listbox is open. */
  close: string;
  /** Accessible label for the toggle button when the listbox is closed. */
  open: string;
}

export const defaultComboboxTranslations: ComboboxTranslations = {
  clear: "Clear",
  close: "Close",
  open: "Open",
};

export type { FloatingPositioning as ComboboxPositioning };

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export type ComboboxState = "closed" | "open";

export interface ComboboxContext {
  id: string;
  /** id of the <input role="combobox"> element. */
  inputId: string;
  /** id of the <ul role="listbox"> element. */
  contentId: string;
  labelId: string;
  /** Current text in the input — drives client-side filtering when onInputChange is absent. */
  inputValue: string;
  /** Selected value(s). Always string[], normalized from string | string[]. */
  value: string[];
  highlighted: string | null;
  /** All registered options (in DOM order). The connect filters these for rendering. */
  options: ComboboxOption[];
  /** Labels of currently selected values — populated on close so they survive portal unmount. */
  selectedLabels: Record<string, string>;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  invalid: boolean;
  multiple: boolean;
  placeholder: string | undefined;
  /** When provided, internal filtering is skipped — the caller filters via onInputChange. */
  onInputChange?: (value: string) => void;
  onValueChange?: (value: string[]) => void;
  onOpenChange?: (open: boolean) => void;
  onHighlightChange?: (value: string | null) => void;
  /** Custom client-side filter. Default: case-insensitive label substring match. */
  filterFn?: (option: ComboboxOption, inputValue: string) => boolean;
  /** Static options list (bypasses DOM REGISTER/UNREGISTER). Required for virtual scrolling. */
  allOptions?: ComboboxOption[];
  /** Called after every highlighted change — user scrolls their virtualizer to the given index. */
  onHighlightedScroll?: (value: string, index: number) => void;
  /** Called when user wants to create a new option. Receives the current input value. */
  onCreateOption?: (value: string) => void;
  translations: ComboboxTranslations;
  // Floating — the input acts as reference (triggerEl), listbox as content (contentEl).
  triggerEl: HTMLElement | null;
  contentEl: HTMLElement | null;
  /** The optional ▾ toggle button — added to watchOutside containers so clicking it doesn't race with INTERACT_OUTSIDE. */
  buttonEl: HTMLElement | null;
  arrowEl: Element | null;
  x: number;
  y: number;
  positioned: boolean;
  currentPlacement: Placement;
  positioning: ResolvedFloatingPositioning;
}

export type ComboboxEvent =
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "INPUT_CHANGE"; value: string }
  | { type: "SELECT_OPTION"; value: string }
  | { type: "SELECT_HIGHLIGHTED" }
  | { type: "HIGHLIGHT_OPTION"; value: string | null }
  | { type: "HIGHLIGHT_NEXT" }
  | { type: "HIGHLIGHT_PREV" }
  | { type: "HIGHLIGHT_FIRST" }
  | { type: "HIGHLIGHT_LAST" }
  | { type: "CLEAR" }
  | { type: "REGISTER_OPTION"; option: ComboboxOption }
  | { type: "UNREGISTER_OPTION"; value: string }
  | { type: "INTERACT_OUTSIDE" }
  | { type: "CREATE_OPTION" }
  | { type: "@@INIT" };

export type ComboboxSend = (event: ComboboxEvent | ComboboxEvent["type"]) => void;
