export interface SliderContext {
  value: number;
  min: number;
  max: number;
  step: number;
  orientation: "horizontal" | "vertical";
  disabled: boolean;
  trackEl: Element | null;
  onValueChange?: (value: number) => void;
  onValueCommit?: (value: number) => void;
}

export type SliderState = "idle" | "dragging";

export type SliderEvent =
  | { type: "POINTER_DOWN"; value: number }
  | { type: "POINTER_UP" }
  | { type: "SET_VALUE"; value: number }
  | { type: "INCREMENT" }
  | { type: "DECREMENT" }
  | { type: "INCREMENT_PAGE" }
  | { type: "DECREMENT_PAGE" }
  | { type: "SET_MIN" }
  | { type: "SET_MAX" };

export interface CreateSliderOptions {
  id?: string;
  /** Controlled value. */
  value?: number;
  /** Default value (uncontrolled). @default min */
  defaultValue?: number;
  /** @default 0 */
  min?: number;
  /** @default 100 */
  max?: number;
  /** @default 1 */
  step?: number;
  /** @default "horizontal" */
  orientation?: "horizontal" | "vertical";
  /** @default false */
  disabled?: boolean;
  onValueChange?: (value: number) => void;
  /** Fires on pointerup / keyboard commit. */
  onValueCommit?: (value: number) => void;
}
