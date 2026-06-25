export interface SliderMark {
  value: number;
  label?: string;
}

export interface SliderContext {
  values: number[];
  min: number;
  max: number;
  step: number;
  orientation: "horizontal" | "vertical";
  disabled: boolean;
  trackEl: Element | null;
  /** Index of the thumb currently being dragged. -1 when not dragging. */
  activeThumb: number;
  /** Optional tick marks along the track. Purely decorative — no snap behavior. */
  marks?: SliderMark[];
  getValueLabel?: (value: number, index: number) => string;
  onValueChange?: (values: number[]) => void;
  onValueCommit?: (values: number[]) => void;
}

export type SliderState = "idle" | "dragging";

export type SliderEvent =
  | { type: "POINTER_DOWN"; value: number; thumbIndex: number }
  | { type: "POINTER_UP" }
  | { type: "SET_VALUE"; value: number; thumbIndex: number }
  | { type: "INCREMENT"; thumbIndex: number }
  | { type: "DECREMENT"; thumbIndex: number }
  | { type: "INCREMENT_PAGE"; thumbIndex: number }
  | { type: "DECREMENT_PAGE"; thumbIndex: number }
  | { type: "SET_MIN"; thumbIndex: number }
  | { type: "SET_MAX"; thumbIndex: number };

export interface CreateSliderOptions {
  id?: string;
  /** Controlled values. Single number accepted as shorthand for a one-thumb slider. */
  value?: number | number[];
  /** Default value (uncontrolled). @default [min] */
  defaultValue?: number | number[];
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
  /** Tick marks along the track. Rendered via Slider.MarkerGroup + Slider.Marker. */
  marks?: SliderMark[];
  /** Produces aria-valuetext for a thumb — use for non-numeric labels ("low", "medium", "high"). */
  getValueLabel?: (value: number, index: number) => string;
  onValueChange?: (values: number[]) => void;
  /** Fires on pointerup / keyboard commit. */
  onValueCommit?: (values: number[]) => void;
}
