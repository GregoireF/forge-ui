export type CheckboxChecked = boolean | "indeterminate";
export type CheckboxState = "unchecked" | "indeterminate" | "checked";

export interface CheckboxContext {
  id: string;
  disabled: boolean;
  required: boolean;
  readOnly: boolean;
  name: string | undefined;
  value: string;
  form: string | undefined;
  rootEl: HTMLElement | null;
  onCheckedChange?: (checked: CheckboxChecked) => void;
}

export type CheckboxEvent =
  | { type: "TOGGLE" }
  | { type: "CHECK" }
  | { type: "UNCHECK" }
  | { type: "SET_INDETERMINATE" }
  | { type: "@@INIT" };

export type CheckboxSend = (event: CheckboxEvent | CheckboxEvent["type"]) => void;
