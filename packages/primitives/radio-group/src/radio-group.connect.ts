import type { MachineInstance, MachineSnapshot } from "@forge-ui/core";
import type { RadioGroupContext, RadioGroupEvent } from "./radio-group.types.js";

type RadioGroupSend = (event: RadioGroupEvent) => void;

export function connectRadioGroup(
  snapshot: MachineSnapshot<RadioGroupContext, "idle">,
  send: RadioGroupSend,
  _machine: Pick<MachineInstance<RadioGroupContext, "idle", RadioGroupEvent>, "setContext">,
) {
  const { context } = snapshot;
  const { value, disabled, orientation, name, required } = context;

  return {
    value,
    disabled,

    send,

    getRootProps() {
      return {
        role: "radiogroup" as const,
        "aria-required": required || undefined,
        "aria-orientation": orientation,
        "data-forge-scope": "radio-group",
        "data-forge-part": "root",
        "data-orientation": orientation,
        "data-disabled": disabled ? ("" as const) : undefined,
      };
    },

    getItemProps(itemValue: string, itemDisabled = false) {
      const isChecked = value === itemValue;
      const isItemDisabled = disabled || itemDisabled;
      return {
        "data-forge-scope": "radio-group",
        "data-forge-part": "item",
        "data-state": isChecked ? ("checked" as const) : ("unchecked" as const),
        "data-disabled": isItemDisabled ? ("" as const) : undefined,
        "data-value": itemValue,
      } as const;
    },

    getRadioProps(itemValue: string, itemDisabled = false) {
      const isChecked = value === itemValue;
      const isItemDisabled = disabled || itemDisabled;
      return {
        id: `forge-radio-${itemValue}`,
        role: "radio" as const,
        type: "button" as const,
        "aria-checked": isChecked,
        "aria-disabled": isItemDisabled || undefined,
        disabled: isItemDisabled || undefined,
        tabIndex: isChecked ? 0 : -1,
        "data-state": isChecked ? ("checked" as const) : ("unchecked" as const),
        "data-disabled": isItemDisabled ? ("" as const) : undefined,
        "data-forge-scope": "radio-group",
        "data-forge-part": "radio",
        onClick() {
          if (!isItemDisabled) {
            send({ type: "SELECT", value: itemValue });
          }
        },
        onKeyDown(e: KeyboardEvent) {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            if (!isItemDisabled) {
              send({ type: "SELECT", value: itemValue });
            }
          }
        },
        onKeydown(e: KeyboardEvent) {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            if (!isItemDisabled) {
              send({ type: "SELECT", value: itemValue });
            }
          }
        },
      };
    },

    getLabelProps(itemValue: string) {
      return {
        htmlFor: `forge-radio-${itemValue}`,
        "data-forge-scope": "radio-group",
        "data-forge-part": "label",
        "data-state": value === itemValue ? ("checked" as const) : ("unchecked" as const),
      } as const;
    },

    getHiddenInputProps(itemValue: string, itemDisabled = false) {
      return {
        type: "radio" as const,
        name: name ?? undefined,
        value: itemValue,
        checked: value === itemValue,
        disabled: disabled || itemDisabled || undefined,
        required: required || undefined,
        "aria-hidden": true as const,
        style: { position: "absolute" as const, opacity: 0, pointerEvents: "none" as const },
      };
    },
  };
}

export type RadioGroupApi = ReturnType<typeof connectRadioGroup>;
