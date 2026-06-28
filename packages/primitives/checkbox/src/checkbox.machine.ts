import { createMachine } from "@forge-ui/core";
import type {
  CheckboxChecked,
  CheckboxContext,
  CheckboxEvent,
  CheckboxState,
} from "./checkbox.types.js";

export interface CreateCheckboxMachineOptions {
  id: string;
  /** Controlled checked state. Pair with onCheckedChange to manage externally. */
  checked?: CheckboxChecked;
  /** Uncontrolled initial checked state. */
  defaultChecked?: CheckboxChecked;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  /** Native form field name. Auto-renders a hidden <input type="checkbox"> when set. */
  name?: string;
  /** Submitted value when checked. Defaults to "on" (matches native checkbox behavior). */
  value?: string;
  /** Associates the hidden input with a <form> by id. */
  form?: string;
  onCheckedChange?: (checked: CheckboxChecked) => void;
}

function checkedToState(checked: CheckboxChecked): CheckboxState {
  if (checked === "indeterminate") return "indeterminate";
  return checked ? "checked" : "unchecked";
}

function invokeOnChange(value: CheckboxChecked) {
  return ({ context }: { context: CheckboxContext }) => {
    context.onCheckedChange?.(value);
  };
}

export function createCheckboxMachine(options: CreateCheckboxMachineOptions) {
  const initial = checkedToState(options.checked ?? options.defaultChecked ?? false);

  return createMachine<CheckboxContext, CheckboxState, CheckboxEvent>({
    id: `forge-checkbox:${options.id}`,
    context: {
      id: options.id,
      disabled: options.disabled ?? false,
      required: options.required ?? false,
      readOnly: options.readOnly ?? false,
      name: options.name,
      value: options.value ?? "on",
      form: options.form,
      rootEl: null,
      ...(options.onCheckedChange !== undefined && { onCheckedChange: options.onCheckedChange }),
    },
    initial,
    states: {
      unchecked: {
        tags: ["unchecked"],
        on: {
          TOGGLE: { target: "checked", actions: [invokeOnChange(true)] },
          CHECK: { target: "checked", actions: [invokeOnChange(true)] },
          SET_INDETERMINATE: {
            target: "indeterminate",
            actions: [invokeOnChange("indeterminate")],
          },
        },
      },
      indeterminate: {
        tags: ["indeterminate"],
        on: {
          // Indeterminate → checked (standard UX: clicking a mixed checkbox checks all)
          TOGGLE: { target: "checked", actions: [invokeOnChange(true)] },
          CHECK: { target: "checked", actions: [invokeOnChange(true)] },
          UNCHECK: { target: "unchecked", actions: [invokeOnChange(false)] },
        },
      },
      checked: {
        tags: ["checked"],
        on: {
          TOGGLE: { target: "unchecked", actions: [invokeOnChange(false)] },
          UNCHECK: { target: "unchecked", actions: [invokeOnChange(false)] },
          SET_INDETERMINATE: {
            target: "indeterminate",
            actions: [invokeOnChange("indeterminate")],
          },
        },
      },
    },
    activities: {},
  });
}
