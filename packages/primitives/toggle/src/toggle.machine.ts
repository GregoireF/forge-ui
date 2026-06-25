import { createMachine } from "@forge-ui/core";
import type {
  CreateToggleOptions,
  ToggleContext,
  ToggleEvent,
  ToggleState,
} from "./toggle.types.js";

function toggle({
  context,
  setContext,
}: {
  context: ToggleContext;
  setContext: (u: Partial<ToggleContext>) => void;
  event: ToggleEvent;
}) {
  if (context.disabled) return;
  const next = !context.pressed;
  setContext({ pressed: next });
  context.onPressedChange?.(next);
}

function press({
  context,
  setContext,
}: {
  context: ToggleContext;
  setContext: (u: Partial<ToggleContext>) => void;
  event: ToggleEvent;
}) {
  if (context.disabled || context.pressed) return;
  setContext({ pressed: true });
  context.onPressedChange?.(true);
}

function release({
  context,
  setContext,
}: {
  context: ToggleContext;
  setContext: (u: Partial<ToggleContext>) => void;
  event: ToggleEvent;
}) {
  if (context.disabled || !context.pressed) return;
  setContext({ pressed: false });
  context.onPressedChange?.(false);
}

export function createToggleMachine(options: CreateToggleOptions) {
  const initialPressed = options.pressed ?? options.defaultPressed ?? false;
  return createMachine<ToggleContext, ToggleState, ToggleEvent>({
    id: `forge-toggle:${options.id ?? "root"}`,
    context: {
      id: options.id ?? "root",
      pressed: initialPressed,
      disabled: options.disabled ?? false,
      ...(options.value !== undefined && { value: options.value }),
      ...(options.onPressedChange !== undefined && {
        onPressedChange: options.onPressedChange,
      }),
    },
    initial: initialPressed ? "on" : "off",
    states: {
      off: {
        on: {
          TOGGLE: { target: "on", actions: [toggle] },
          PRESS: { target: "on", actions: [press] },
        },
      },
      on: {
        on: {
          TOGGLE: { target: "off", actions: [toggle] },
          RELEASE: { target: "off", actions: [release] },
        },
      },
    },
    activities: {},
  });
}
