import type { CreateNumberInputOptions, NumberInputApi } from "@forge-ui/number-input";
import { connectNumberInput, createNumberInputMachine } from "@forge-ui/number-input";
import { useId, useLayoutEffect, useState } from "react";
import { useMachine } from "../../use-machine.js";

export interface UseNumberInputOptions extends Omit<CreateNumberInputOptions, "id"> {
  id?: string;
}

export function useNumberInput(options: UseNumberInputOptions = {}): NumberInputApi {
  const reactId = useId();
  const id = options.id ?? reactId.replace(/:/g, "");

  const [machine] = useState(() => createNumberInputMachine({ id, ...options }));
  const [snapshot, send] = useMachine(machine);

  // Sync controlled value into the machine.
  useLayoutEffect(() => {
    if (options.value !== undefined) {
      machine.update({ value: options.value ?? null });
    }
  // biome-ignore lint/correctness/useExhaustiveDependencies: options.value triggers sync
  }, [options.value]);

  return connectNumberInput(snapshot, send, machine);
}
