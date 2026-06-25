import type { CreateDateRangePickerOptions } from "@forge-ui/date-range-picker";
import { connectDateRangePicker, createDateRangePickerMachine } from "@forge-ui/date-range-picker";
import { useId, useLayoutEffect, useState } from "react";
import { useMachine } from "../../use-machine.js";

export interface UseDateRangePickerOptions extends Omit<CreateDateRangePickerOptions, "id"> {
  id?: string;
}

export function useDateRangePicker(options: UseDateRangePickerOptions = {}) {
  const reactId = useId();
  const id = options.id ?? reactId.replace(/:/g, "");

  const [machine] = useState(() => createDateRangePickerMachine({ id, ...options }));
  const [snapshot, send] = useMachine(machine);

  useLayoutEffect(() => {
    if (options.value !== undefined) {
      machine.update({
        startDate: options.value?.start ?? null,
        endDate: options.value?.end ?? null,
      });
    }
  // biome-ignore lint/correctness/useExhaustiveDependencies: value object reference triggers sync
  }, [options.value]);

  return connectDateRangePicker(snapshot, send, machine);
}

export type UseDateRangePickerReturn = ReturnType<typeof useDateRangePicker>;
