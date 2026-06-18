import type { MachineInstance, MachineSnapshot } from "@forge-ui/core";
import type { CheckboxChecked, CheckboxContext, CheckboxEvent, CheckboxSend, CheckboxState } from "./checkbox.types.js";

export type CheckboxApi = ReturnType<typeof connectCheckbox>;

export function connectCheckbox(
  snapshot: MachineSnapshot<CheckboxContext, CheckboxState>,
  send: CheckboxSend,
  machine: Pick<MachineInstance<CheckboxContext, CheckboxState, CheckboxEvent>, "setContext">,
) {
  const { context } = snapshot;
  const isChecked = snapshot.matches("checked");
  const isIndeterminate = snapshot.matches("indeterminate");
  const checked: CheckboxChecked = isChecked ? true : isIndeterminate ? "indeterminate" : false;
  const dataState = isChecked ? "checked" : isIndeterminate ? "indeterminate" : "unchecked";

  // Stable IDs derived from the machine id so Label.htmlFor ↔ Control.id works.
  const controlId = `${context.id}-control`;
  const labelId = `${context.id}-label`;

  return {
    checked,
    isChecked,
    isIndeterminate,
    dataState,
    isDisabled: context.disabled,
    isRequired: context.required,
    isReadOnly: context.readOnly,

    getRootProps() {
      return {
        "data-state": dataState,
        "data-disabled": context.disabled ? "" : undefined,
        "data-required": context.required ? "" : undefined,
        "data-readonly": context.readOnly ? "" : undefined,
        "data-forge-scope": "checkbox",
        "data-forge-part": "root",
        ref: (el: unknown) => machine.setContext({ rootEl: el as HTMLElement | null }),
      };
    },

    getControlProps() {
      return {
        id: controlId,
        type: "button" as const,
        role: "checkbox" as const,
        // aria-checked is "mixed" for indeterminate per WAI-ARIA 1.2
        "aria-checked": isIndeterminate ? ("mixed" as const) : isChecked,
        "aria-required": context.required ? true : undefined,
        "aria-disabled": context.disabled ? true : undefined,
        "aria-readonly": context.readOnly ? true : undefined,
        "aria-labelledby": labelId,
        "data-state": dataState,
        "data-disabled": context.disabled ? "" : undefined,
        "data-forge-scope": "checkbox",
        "data-forge-part": "control",
        tabIndex: context.disabled ? -1 : 0,
        onClick(e: { preventDefault: () => void }) {
          if (context.disabled || context.readOnly) return;
          e.preventDefault();
          send("TOGGLE");
        },
      };
    },

    getIndicatorProps() {
      return {
        "aria-hidden": true as const,
        "data-state": dataState,
        "data-disabled": context.disabled ? "" : undefined,
        "data-forge-scope": "checkbox",
        "data-forge-part": "indicator",
      };
    },

    getLabelProps() {
      return {
        id: labelId,
        htmlFor: controlId,
        "data-disabled": context.disabled ? "" : undefined,
        "data-forge-scope": "checkbox",
        "data-forge-part": "label",
      };
    },

    getHiddenInputProps() {
      return {
        type: "checkbox" as const,
        "aria-hidden": true as const,
        tabIndex: -1 as const,
        checked: isChecked,
        name: context.name,
        value: context.value,
        disabled: context.disabled,
        required: context.required,
        ...(context.form !== undefined && { form: context.form }),
        // readOnly prevents React from requiring onChange; we manage state via the button.
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
