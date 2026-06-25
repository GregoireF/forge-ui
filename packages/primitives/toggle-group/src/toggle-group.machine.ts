import { createMachine } from "@forge-ui/core";
import type {
  CreateToggleGroupOptions,
  ToggleGroupContext,
  ToggleGroupEvent,
  ToggleGroupState,
} from "./toggle-group.types.js";

function pressItem({
  context,
  setContext,
  event,
}: {
  context: ToggleGroupContext;
  setContext: (u: Partial<ToggleGroupContext>) => void;
  event: Extract<ToggleGroupEvent, { type: "PRESS_ITEM" }>;
}) {
  if (context.disabled) return;
  const { value: itemValue } = event;
  let next: string[];

  if (context.type === "single") {
    // Clicking the already-selected item in single mode deselects it
    next = context.value.includes(itemValue) ? [] : [itemValue];
  } else {
    next = context.value.includes(itemValue)
      ? context.value.filter((v) => v !== itemValue)
      : [...context.value, itemValue];
  }

  setContext({ value: next });
  context.onValueChange?.(next);
}

function setValue({
  setContext,
  event,
}: {
  context: ToggleGroupContext;
  setContext: (u: Partial<ToggleGroupContext>) => void;
  event: Extract<ToggleGroupEvent, { type: "SET_VALUE" }>;
}) {
  setContext({ value: event.value });
}

export function createToggleGroupMachine(options: CreateToggleGroupOptions) {
  return createMachine<ToggleGroupContext, ToggleGroupState, ToggleGroupEvent>({
    id: `forge-toggle-group:${options.id ?? "root"}`,
    context: {
      id: options.id ?? "root",
      type: options.type ?? "multiple",
      value: options.value ?? options.defaultValue ?? [],
      disabled: options.disabled ?? false,
      orientation: options.orientation ?? "horizontal",
      rovingFocus: options.rovingFocus ?? true,
      loop: options.loop ?? true,
      ...(options.onValueChange !== undefined && {
        onValueChange: options.onValueChange,
      }),
    },
    initial: "idle",
    states: {
      idle: {
        on: {
          PRESS_ITEM: { actions: [pressItem] },
          SET_VALUE: { actions: [setValue] },
        },
      },
    },
    activities: {},
  });
}
