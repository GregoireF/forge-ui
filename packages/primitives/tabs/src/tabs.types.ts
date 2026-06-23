export type TabsActivationMode = "automatic" | "manual";

export interface TabsContext {
  value: string | undefined;
  activationMode: TabsActivationMode;
  disabled: boolean;
  orientation: "horizontal" | "vertical";
  /** Accessible label for the tablist — required by WAI-ARIA when no visible heading labels the list. */
  label?: string;
  onValueChange?: (value: string) => void;
}

export type TabsEvent =
  | { type: "SELECT_TAB"; value: string }
  | { type: "SET_VALUE"; value: string | undefined };

export interface CreateTabsOptions {
  id?: string;
  /** Active tab value (controlled). */
  value?: string;
  /** Default active tab (uncontrolled). */
  defaultValue?: string;
  /** @default "automatic" — focus activates tab immediately */
  activationMode?: TabsActivationMode;
  /** @default false */
  disabled?: boolean;
  /** @default "horizontal" */
  orientation?: "horizontal" | "vertical";
  /** Accessible label for the tablist — set when no visible element labels the tab set. */
  label?: string;
  onValueChange?: (value: string) => void;
}
