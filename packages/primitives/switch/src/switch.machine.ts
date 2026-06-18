import { createMachine } from "@forge-ui/core";
import type { SwitchContext, SwitchEvent, SwitchState } from "./switch.types.js";

export interface CreateSwitchMachineOptions {
  id: string;
  /** Controlled checked state. Pair with onCheckedChange to manage externally. */
  checked?: boolean;
  /** Uncontrolled initial checked state. */
  defaultChecked?: boolean;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  /** Native form field name. Auto-renders a hidden <input type="checkbox"> when set. */
  name?: string;
  /** Submitted value when on. Defaults to "on". */
  value?: string;
  /** Associates the hidden input with a <form> by id. */
  form?: string;
  onCheckedChange?: (checked: boolean) => void;
}

function invokeOnChange(value: boolean) {
  return ({ context }: { context: SwitchContext }) => {
    context.onCheckedChange?.(value);
  };
}

export function createSwitchMachine(options: CreateSwitchMachineOptions) {
  const initial: SwitchState = (options.checked ?? options.defaultChecked ?? false) ? "on" : "off";

  return createMachine<SwitchContext, SwitchState, SwitchEvent>({
    id: `forge-switch:${options.id}`,
    context: {
      id: options.id,
      disabled: options.disabled ?? false,
      required: options.required ?? false,
      readOnly: options.readOnly ?? false,
      invalid: options.invalid ?? false,
      name: options.name,
      value: options.value ?? "on",
      form: options.form,
      rootEl: null,
      ...(options.onCheckedChange !== undefined && { onCheckedChange: options.onCheckedChange }),
    },
    initial,
    states: {
      off: {
        tags: ["off"],
        on: {
          TOGGLE: { target: "on", actions: [invokeOnChange(true)] },
          CHECK: { target: "on", actions: [invokeOnChange(true)] },
        },
      },
      on: {
        tags: ["on"],
        on: {
          TOGGLE: { target: "off", actions: [invokeOnChange(false)] },
          UNCHECK: { target: "off", actions: [invokeOnChange(false)] },
        },
      },
    },
    activities: {},
  });
}
