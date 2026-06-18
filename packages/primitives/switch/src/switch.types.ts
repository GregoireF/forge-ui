export type SwitchState = "off" | "on";

export interface SwitchContext {
  id: string;
  disabled: boolean;
  required: boolean;
  readOnly: boolean;
  name: string | undefined;
  value: string;
  form: string | undefined;
  rootEl: HTMLElement | null;
  onCheckedChange?: (checked: boolean) => void;
}

export type SwitchEvent =
  | { type: "TOGGLE" }
  | { type: "CHECK" }
  | { type: "UNCHECK" }
  | { type: "@@INIT" };

export type SwitchSend = (event: SwitchEvent | SwitchEvent["type"]) => void;
