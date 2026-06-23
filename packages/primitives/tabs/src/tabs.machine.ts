import { createMachine } from "@forge-ui/core";
import type { CreateTabsOptions, TabsContext, TabsEvent } from "./tabs.types.js";

function selectTab({
  context,
  setContext,
  event,
}: {
  context: TabsContext;
  setContext: (u: Partial<TabsContext>) => void;
  event: Extract<TabsEvent, { type: "SELECT_TAB" }>;
}) {
  if (context.disabled) return;
  setContext({ value: event.value });
  context.onValueChange?.(event.value);
}

function setValue({
  setContext,
  event,
}: {
  context: TabsContext;
  setContext: (u: Partial<TabsContext>) => void;
  event: Extract<TabsEvent, { type: "SET_VALUE" }>;
}) {
  setContext({ value: event.value });
}

export function createTabsMachine(options: CreateTabsOptions) {
  return createMachine<TabsContext, "idle", TabsEvent>({
    id: `forge-tabs:${options.id ?? "root"}`,
    context: {
      value: options.value ?? options.defaultValue,
      activationMode: options.activationMode ?? "automatic",
      disabled: options.disabled ?? false,
      orientation: options.orientation ?? "horizontal",
      ...(options.onValueChange !== undefined && { onValueChange: options.onValueChange }),
    },
    initial: "idle",
    states: {
      idle: {
        on: {
          SELECT_TAB: { actions: [selectTab] },
          SET_VALUE: { actions: [setValue] },
        },
      },
    },
    activities: {},
  });
}
