export type CollapsibleState = "idle";

export interface CollapsibleContext {
  id: string;
  open: boolean;
  disabled: boolean;
  onOpenChange?: (open: boolean) => void;
}

export type CollapsibleEvent = { type: "TOGGLE" } | { type: "SET_OPEN"; open: boolean };

export interface CreateCollapsibleOptions {
  id?: string;
  /** Controlled open state. */
  open?: boolean;
  /** Default open state (uncontrolled). @default false */
  defaultOpen?: boolean;
  /** @default false */
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
}
