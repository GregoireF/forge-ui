import type { CreateCheckboxMachineOptions } from "@forge-ui/checkbox";
import { connectCheckbox, createCheckboxMachine } from "@forge-ui/checkbox";
import type { CheckboxChecked } from "@forge-ui/checkbox";
import { useId, useLayoutEffect, useState } from "react";
import { useMachine } from "../../use-machine.js";

export interface UseCheckboxOptions extends Omit<CreateCheckboxMachineOptions, "id"> {
  id?: string;
}

export function useCheckbox(options: UseCheckboxOptions = {}) {
  const reactId = useId();
  const id = options.id ?? reactId.replace(/:/g, "");

  const [machine] = useState(() => createCheckboxMachine({ id, ...options }));

  // Sync controlled `checked` prop via layout effect to avoid "setState during render".
  const { checked } = options;
  useLayoutEffect(() => {
    if (checked === undefined) return;
    const state = machine.getSnapshot().value as string;
    const target = checked === "indeterminate" ? "indeterminate" : checked ? "checked" : "unchecked";
    if (state === target) return;
    if (checked === "indeterminate") machine.send("SET_INDETERMINATE");
    else if (checked) machine.send("CHECK");
    else machine.send("UNCHECK");
  }, [checked, machine]);

  const [snapshot, send] = useMachine(machine);

  return {
    ...connectCheckbox(snapshot, send, machine),
    send,
  };
}

export type UseCheckboxReturn = ReturnType<typeof useCheckbox>;
export type { CheckboxChecked };
