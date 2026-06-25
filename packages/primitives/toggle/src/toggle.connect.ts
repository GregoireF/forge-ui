import type { MachineInstance, MachineSnapshot } from "@forge-ui/core";
import type { ToggleContext, ToggleEvent, ToggleState } from "./toggle.types.js";

type ToggleSend = (event: ToggleEvent) => void;

export function connectToggle(
  snapshot: MachineSnapshot<ToggleContext, ToggleState>,
  send: ToggleSend,
  _machine: Pick<MachineInstance<ToggleContext, ToggleState, ToggleEvent>, "setContext">,
) {
  const { context } = snapshot;
  const isPressed = context.pressed;
  const state = isPressed ? ("on" as const) : ("off" as const);

  return {
    isPressed,
    isDisabled: context.disabled,
    value: context.value,
    send,

    getRootProps() {
      return {
        type: "button" as const,
        role: "button" as const,
        "aria-pressed": isPressed,
        "aria-disabled": context.disabled || undefined,
        disabled: context.disabled || undefined,
        "data-state": state,
        "data-pressed": isPressed ? ("" as const) : undefined,
        "data-disabled": context.disabled ? ("" as const) : undefined,
        "data-forge-scope": "toggle",
        "data-forge-part": "root",
        ...(context.value !== undefined && { "data-value": context.value }),
        onClick() {
          if (!context.disabled) send({ type: "TOGGLE" });
        },
        onKeyDown(e: KeyboardEvent) {
          if ((e.key === "Enter" || e.key === " ") && !context.disabled) {
            e.preventDefault();
            send({ type: "TOGGLE" });
          }
        },
        onKeydown(e: KeyboardEvent) {
          if ((e.key === "Enter" || e.key === " ") && !context.disabled) {
            e.preventDefault();
            send({ type: "TOGGLE" });
          }
        },
      };
    },
  };
}

export type ToggleApi = ReturnType<typeof connectToggle>;
