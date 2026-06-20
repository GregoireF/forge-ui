import { createMachine } from "@forge-ui/core";
import type { CreateRadioGroupOptions, RadioGroupContext, RadioGroupEvent } from "./radio-group.types.js";

function select({
  context,
  setContext,
  event,
}: {
  context: RadioGroupContext;
  setContext: (u: Partial<RadioGroupContext>) => void;
  event: RadioGroupEvent;
}) {
  if (event.type !== "SELECT") return;
  if (context.disabled) return;
  setContext({ value: event.value });
  context.onValueChange?.(event.value);
}

function setValue({
  setContext,
  event,
}: {
  context: RadioGroupContext;
  setContext: (u: Partial<RadioGroupContext>) => void;
  event: RadioGroupEvent;
}) {
  if (event.type !== "SET_VALUE") return;
  setContext({ value: event.value });
}

export function createRadioGroupMachine(options: CreateRadioGroupOptions) {
  return createMachine<RadioGroupContext, "idle", RadioGroupEvent>({
    id: `forge-radio-group:${options.id ?? "root"}`,
    context: {
      value: options.value ?? options.defaultValue,
      disabled: options.disabled ?? false,
      required: options.required ?? false,
      orientation: options.orientation ?? "vertical",
      name: options.name,
      ...(options.onValueChange !== undefined && { onValueChange: options.onValueChange }),
    },
    initial: "idle",
    states: {
      idle: {
        on: {
          SELECT: { actions: [select] },
          SET_VALUE: { actions: [setValue] },
        },
      },
    },
    activities: {},
  });
}
