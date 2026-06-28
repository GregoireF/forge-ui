import type { MachineInstance, MachineSnapshot } from "@forge-ui/core";
import type { RadioGroupContext, RadioGroupEvent } from "./radio-group.types.js";

type RadioGroupSend = (event: RadioGroupEvent) => void;

/**
 * WAI-ARIA Radio Group Pattern §keyboard.
 * Arrow keys move focus AND select simultaneously (unlike Tabs where they are separate).
 * Both axes are supported regardless of orientation so users are never blocked.
 * Tab is handled by the browser via roving tabIndex (tabIndex 0 on checked, -1 elsewhere).
 * TODO: when no value is selected the first enabled radio should be tabIndex 0 so
 *       the group is reachable via Tab — requires framework-level first-item tracking.
 */
function navigateRadioGroup(e: KeyboardEvent, send: RadioGroupSend): boolean {
  const isNext = e.key === "ArrowDown" || e.key === "ArrowRight";
  const isPrev = e.key === "ArrowUp" || e.key === "ArrowLeft";
  if (!isNext && !isPrev) return false;

  e.preventDefault();
  const current = e.currentTarget as HTMLElement;
  const root = current.closest<HTMLElement>('[data-forge-scope="radio-group"][data-forge-part="root"]');
  if (!root) return true;
  const radios = [
    ...root.querySelectorAll<HTMLElement>('[data-forge-part="radio"]:not([disabled])'),
  ];
  const idx = radios.indexOf(current);
  const dir = isNext ? 1 : -1;
  const target = radios[(idx + dir + radios.length) % radios.length];
  if (!target) return true;

  target.focus();
  const val = target.closest<HTMLElement>('[data-forge-part="item"]')?.dataset["value"];
  if (val) send({ type: "SELECT", value: val });
  return true;
}

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
          if (navigateRadioGroup(e, send)) return;
          if ((e.key === " " || e.key === "Enter") && !isItemDisabled) {
            e.preventDefault();
            send({ type: "SELECT", value: itemValue });
          }
        },
        onKeydown(e: KeyboardEvent) {
          if (navigateRadioGroup(e, send)) return;
          if ((e.key === " " || e.key === "Enter") && !isItemDisabled) {
            e.preventDefault();
            send({ type: "SELECT", value: itemValue });
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
