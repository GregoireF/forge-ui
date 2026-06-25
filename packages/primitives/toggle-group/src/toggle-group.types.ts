export type ToggleGroupState = "idle";

export interface ToggleGroupContext {
  id: string;
  type: "single" | "multiple";
  value: string[];
  disabled: boolean;
  orientation: "horizontal" | "vertical";
  rovingFocus: boolean;
  loop: boolean;
  onValueChange?: (value: string[]) => void;
}

export type ToggleGroupEvent =
  | { type: "PRESS_ITEM"; value: string }
  | { type: "SET_VALUE"; value: string[] };

export interface CreateToggleGroupOptions {
  id?: string;
  /** Single selection (radio-like) or multiple. @default "multiple" */
  type?: "single" | "multiple";
  /** Controlled value. */
  value?: string[];
  /** @default [] */
  defaultValue?: string[];
  /** @default false */
  disabled?: boolean;
  /** @default "horizontal" */
  orientation?: "horizontal" | "vertical";
  /**
   * Enable arrow-key navigation between items (roving tabindex).
   * Required for role="toolbar" keyboard compliance.
   * @default true
   */
  rovingFocus?: boolean;
  /** Wrap around at edges during arrow-key navigation. @default true */
  loop?: boolean;
  onValueChange?: (value: string[]) => void;
}
