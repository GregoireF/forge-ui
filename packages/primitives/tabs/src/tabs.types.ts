export type TabsActivationMode = "automatic" | "manual";

export interface TabsContext {
  value: string | undefined;
  activationMode: TabsActivationMode;
  disabled: boolean;
  orientation: "horizontal" | "vertical";
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
  onValueChange?: (value: string) => void;
}
