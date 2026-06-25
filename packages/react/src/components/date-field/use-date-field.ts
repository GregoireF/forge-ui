import type { CreateDateFieldOptions } from "@forge-ui/date-field";
import { connectDateField, createDateFieldMachine } from "@forge-ui/date-field";
import { useId, useLayoutEffect, useState } from "react";
import { useMachine } from "../../use-machine.js";

export interface UseDateFieldOptions extends Omit<CreateDateFieldOptions, "id"> {
  id?: string;
}

export function useDateField(options: UseDateFieldOptions = {}) {
  const reactId = useId();
  const id = options.id ?? reactId.replace(/:/g, "");

  const [machine] = useState(() => createDateFieldMachine({ id, ...options }));
  const [snapshot, send] = useMachine(machine);

  useLayoutEffect(() => {
    if (options.value !== undefined) {
      machine.update({
        dayValue: options.value?.day ?? null,
        monthValue: options.value?.month ?? null,
        yearValue: options.value?.year ?? null,
      });
    }
  // biome-ignore lint/correctness/useExhaustiveDependencies: value object reference triggers sync
  }, [options.value]);

  return connectDateField(snapshot, send, machine);
}

export type UseDateFieldReturn = ReturnType<typeof useDateField>;
