import type { CreateDatePickerOptions } from "@forge-ui/date-picker";
import { connectDatePicker, createDatePickerMachine } from "@forge-ui/date-picker";
import { useId, useLayoutEffect, useState } from "react";
import { useMachine } from "../../use-machine.js";

export interface UseDatePickerOptions extends Omit<CreateDatePickerOptions, "id"> {
  id?: string;
}

export function useDatePicker(options: UseDatePickerOptions = {}) {
  const reactId = useId();
  const id = options.id ?? reactId.replace(/:/g, "");

  const [machine] = useState(() => createDatePickerMachine({ id, ...options }));
  const [snapshot, send] = useMachine(machine);

  useLayoutEffect(() => {
    if (options.value !== undefined) {
      machine.update({ value: options.value ?? null });
    }
  // biome-ignore lint/correctness/useExhaustiveDependencies: value object reference triggers sync
  }, [options.value]);

  return connectDatePicker(snapshot, send, machine);
}

export type UseDatePickerReturn = ReturnType<typeof useDatePicker>;
