export interface RadioGroupContext {
  value: string | undefined;
  disabled: boolean;
  required: boolean;
  orientation: "horizontal" | "vertical";
  name: string | undefined;
  onValueChange?: (value: string) => void;
}

export type RadioGroupEvent =
  | { type: "SELECT"; value: string }
  | { type: "SET_VALUE"; value: string | undefined };

export interface CreateRadioGroupOptions {
  id?: string;
  /** Controlled selected value. */
  value?: string;
  /** Default selected value (uncontrolled). */
  defaultValue?: string;
  /** @default false */
  disabled?: boolean;
  /** @default false */
  required?: boolean;
  /** @default "vertical" */
  orientation?: "horizontal" | "vertical";
  /** HTML name for form submission — applied to each radio input. */
  name?: string;
  onValueChange?: (value: string) => void;
}
