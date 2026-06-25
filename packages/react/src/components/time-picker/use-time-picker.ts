import type { CreateTimePickerOptions } from "@forge-ui/time-picker";
import { connectTimePicker, createTimePickerMachine } from "@forge-ui/time-picker";
import { useId, useLayoutEffect, useState } from "react";
import { useMachine } from "../../use-machine.js";

export interface UseTimePickerOptions extends Omit<CreateTimePickerOptions, "id"> {
  id?: string;
}

export function useTimePicker(options: UseTimePickerOptions = {}) {
  const reactId = useId();
  const id = options.id ?? reactId.replace(/:/g, "");

  const [machine] = useState(() => createTimePickerMachine({ id, ...options }));
  const [snapshot, send] = useMachine(machine);

  useLayoutEffect(() => {
    if (options.value !== undefined) {
      if (options.value === null) {
        machine.update({ hoursValue: null, minutesValue: null, secondsValue: null });
      } else {
        machine.update({
          hoursValue: options.value.hours,
          minutesValue: options.value.minutes,
          secondsValue: options.value.seconds,
          period: options.value.hours >= 12 ? "PM" : "AM",
        });
      }
    }
  // biome-ignore lint/correctness/useExhaustiveDependencies: value object reference triggers sync
  }, [options.value]);

  return connectTimePicker(snapshot, send, machine);
}

export type UseTimePickerReturn = ReturnType<typeof useTimePicker>;
