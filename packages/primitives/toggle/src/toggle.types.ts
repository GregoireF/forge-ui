export type ToggleState = "on" | "off";

export interface ToggleContext {
  id: string;
  pressed: boolean;
  disabled: boolean;
  value?: string;
  onPressedChange?: (pressed: boolean) => void;
}

export type ToggleEvent =
  | { type: "TOGGLE" }
  | { type: "PRESS" }
  | { type: "RELEASE" };

export interface CreateToggleOptions {
  id?: string;
  /** Controlled pressed state. */
  pressed?: boolean;
  /** @default false */
  defaultPressed?: boolean;
  /** @default false */
  disabled?: boolean;
  /** Identifies this item within a ToggleGroup. */
  value?: string;
  onPressedChange?: (pressed: boolean) => void;
}
