import type { CreateRadioGroupOptions, RadioGroupApi } from "@forge-ui/radio-group";
import { connectRadioGroup, createRadioGroupMachine } from "@forge-ui/radio-group";
import { useId, useLayoutEffect, useState } from "react";
import { useMachine } from "../../use-machine.js";

export interface UseRadioGroupOptions extends Omit<CreateRadioGroupOptions, "id"> {
  id?: string;
}

export function useRadioGroup(options: UseRadioGroupOptions = {}): RadioGroupApi {
  const reactId = useId();
  const id = options.id ?? reactId.replace(/:/g, "");

  const [machine] = useState(() => createRadioGroupMachine({ id, ...options }));
  const [snapshot, send] = useMachine(machine);

  useLayoutEffect(() => {
    if (options.value !== undefined) {
      machine.send({ type: "SET_VALUE", value: options.value });
    }
  }, [options.value]);

  return connectRadioGroup(snapshot, send, machine);
}
