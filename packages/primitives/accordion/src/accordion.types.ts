export type AccordionType = "single" | "multiple";
export type AccordionState = "idle";

export interface AccordionContext {
  /** Currently expanded item value(s). */
  value: string[];
  /** "single" allows only one item open at a time; "multiple" allows any number. */
  type: AccordionType;
  /** (single mode only) Whether the open item can be collapsed by clicking it again. */
  collapsible: boolean;
  /** Disables all items. */
  disabled: boolean;
  onValueChange?: (value: string[]) => void;
}

export type AccordionEvent =
  | { type: "TOGGLE_ITEM"; value: string }
  | { type: "SET_VALUE"; value: string[] };

export interface CreateAccordionOptions {
  id?: string;
  /** @default "single" */
  type?: AccordionType;
  /** Controlled open values. */
  value?: string[];
  /** Default open value(s) for uncontrolled mode. */
  defaultValue?: string | string[];
  /** @default false */
  collapsible?: boolean;
  /** @default false */
  disabled?: boolean;
  onValueChange?: (value: string[]) => void;
}
