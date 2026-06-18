import type { MachineInstance, MachineSnapshot } from "@forge-ui/core";
import type { SwitchContext, SwitchEvent, SwitchSend, SwitchState } from "./switch.types.js";

export type SwitchApi = ReturnType<typeof connectSwitch>;

export function connectSwitch(
  snapshot: MachineSnapshot<SwitchContext, SwitchState>,
  send: SwitchSend,
  machine: Pick<MachineInstance<SwitchContext, SwitchState, SwitchEvent>, "setContext">,
) {
  const { context } = snapshot;
  const isChecked = snapshot.matches("on");
  const dataState = isChecked ? "on" : "off";

  const controlId = `${context.id}-control`;
  const labelId = `${context.id}-label`;

  return {
    isChecked,
    dataState,
    isDisabled: context.disabled,
    isRequired: context.required,
    isReadOnly: context.readOnly,

    getRootProps() {
      return {
        "data-state": dataState,
        "data-disabled": context.disabled ? "" : undefined,
        "data-required": context.required ? "" : undefined,
        "data-forge-scope": "switch",
        "data-forge-part": "root",
        ref: (el: unknown) => machine.setContext({ rootEl: el as HTMLElement | null }),
      };
    },

    getControlProps() {
      return {
        id: controlId,
        type: "button" as const,
        role: "switch" as const,
        "aria-checked": isChecked,
        "aria-required": context.required ? true : undefined,
        "aria-disabled": context.disabled ? true : undefined,
        "aria-labelledby": labelId,
        "data-state": dataState,
        "data-disabled": context.disabled ? "" : undefined,
        "data-forge-scope": "switch",
        "data-forge-part": "control",
        tabIndex: context.disabled ? -1 : 0,
        onClick(e: { preventDefault: () => void }) {
          if (context.disabled || context.readOnly) return;
          e.preventDefault();
          send("TOGGLE");
        },
      };
    },

    getThumbProps() {
      return {
        "aria-hidden": true as const,
        "data-state": dataState,
        "data-disabled": context.disabled ? "" : undefined,
        "data-forge-scope": "switch",
        "data-forge-part": "thumb",
      };
    },

    getLabelProps() {
      return {
        id: labelId,
        htmlFor: controlId,
        "data-disabled": context.disabled ? "" : undefined,
        "data-forge-scope": "switch",
        "data-forge-part": "label",
      };
    },

    getHiddenInputProps() {
      return {
        type: "checkbox" as const,
        role: "switch" as const,
        "aria-hidden": true as const,
        tabIndex: -1 as const,
        checked: isChecked,
        name: context.name,
        value: context.value,
        disabled: context.disabled,
        required: context.required,
        ...(context.form !== undefined && { form: context.form }),
        readOnly: true as const,
        style: {
          position: "absolute" as const,
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap" as const,
          borderWidth: 0,
          pointerEvents: "none" as const,
        },
      };
    },
  };
}
