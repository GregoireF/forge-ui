import type { CreateTagsInputMachineOptions } from "@forge-ui/tags-input";
import { connectTagsInput, createTagsInputMachine } from "@forge-ui/tags-input";
import { useId, useLayoutEffect, useState } from "react";
import { useMachine } from "../../use-machine.js";

export interface UseTagsInputOptions extends Omit<CreateTagsInputMachineOptions, "id"> {
  id?: string;
}

export function useTagsInput(options: UseTagsInputOptions = {}) {
  const reactId = useId();
  const id = options.id ?? reactId.replace(/:/g, "");

  const [machine] = useState(() => createTagsInputMachine({ id, ...options }));

  // Sync controlled `value` prop via layout effect.
  const { value } = options;
  useLayoutEffect(() => {
    if (value === undefined) return;
    machine.send({ type: "SET_VALUE", value });
  }, [value, machine]);

  const [snapshot, send] = useMachine(machine);

  return {
    ...connectTagsInput(snapshot, send, machine),
    send,
  };
}

export type UseTagsInputReturn = ReturnType<typeof useTagsInput>;
