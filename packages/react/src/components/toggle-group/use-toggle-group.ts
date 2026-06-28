import type { CreateToggleGroupOptions } from "@forge-ui/toggle-group";
import { connectToggleGroup, createToggleGroupMachine } from "@forge-ui/toggle-group";
import { useId, useLayoutEffect, useState } from "react";
import { useMachine } from "../../use-machine.js";

export interface UseToggleGroupOptions extends Omit<CreateToggleGroupOptions, "id"> {
  id?: string;
}

export function useToggleGroup(options: UseToggleGroupOptions = {}) {
  const reactId = useId();
  const id = options.id ?? reactId.replace(/:/g, "");

  const [machine] = useState(() => createToggleGroupMachine({ id, ...options }));

  const { value } = options;
  useLayoutEffect(() => {
    if (value === undefined) return;
    machine.send({ type: "SET_VALUE", value });
  }, [value, machine]);

  const [snapshot, send] = useMachine(machine);

  return {
    ...connectToggleGroup(snapshot, send, machine),
    send,
  };
}

export type UseToggleGroupReturn = ReturnType<typeof useToggleGroup>;
