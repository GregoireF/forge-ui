export interface NumberInputContext {
  value: number | null;
  /** Text currently shown in the input. Differs from formatted value while editing. */
  inputText: string;
  min: number;
  max: number;
  step: number;
  largeStep: number;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  focused: boolean;
  locale: string;
  fractionDigits: number;
  allowEmpty: boolean;
  formatOptions?: Intl.NumberFormatOptions;
  getValueLabel?: (value: number) => string;
  onValueChange?: (value: number | null) => void;
  onValueCommit?: (value: number | null) => void;
  onFocus?: (e: FocusEvent) => void;
  onBlur?: (e: FocusEvent) => void;
}

export type NumberInputState = "idle" | "spinning.up" | "spinning.down";

export type NumberInputEvent =
  | { type: "INCREMENT" }
  | { type: "DECREMENT" }
  | { type: "INCREMENT_PAGE" }
  | { type: "DECREMENT_PAGE" }
  | { type: "SET_VALUE"; value: number | null }
  | { type: "SET_MIN" }
  | { type: "SET_MAX" }
  | { type: "SET_INPUT_TEXT"; text: string }
  | { type: "FOCUS"; event: FocusEvent }
  | { type: "BLUR"; event: FocusEvent }
  | { type: "SPIN_START_UP" }
  | { type: "SPIN_START_DOWN" }
  | { type: "SPIN_STOP" };

export interface CreateNumberInputOptions {
  id?: string;
  /** Controlled value. */
  value?: number | null;
  /** Uncontrolled initial value. */
  defaultValue?: number | null;
  /** @default 0 */
  min?: number;
  /** @default Infinity */
  max?: number;
  /** @default 1 */
  step?: number;
  /** Step used by PageUp/PageDown. @default step * 10 */
  largeStep?: number;
  /** @default false */
  disabled?: boolean;
  /** @default false */
  readOnly?: boolean;
  /** @default false */
  required?: boolean;
  /** BCP 47 locale tag for formatting. @default "en" */
  locale?: string;
  /** Decimal places for display and validation. @default 0 */
  fractionDigits?: number;
  /** Intl.NumberFormat options (overrides fractionDigits). */
  formatOptions?: Intl.NumberFormatOptions;
  /** When true, empty input is valid (value = null). @default false */
  allowEmpty?: boolean;
  /** Produces aria-valuetext — use for custom labels ("low/medium/high"). */
  getValueLabel?: (value: number) => string;
  onValueChange?: (value: number | null) => void;
  /** Fires on blur after parsing and clamping. */
  onValueCommit?: (value: number | null) => void;
  onFocus?: (e: FocusEvent) => void;
  onBlur?: (e: FocusEvent) => void;
}
