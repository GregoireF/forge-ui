import type { CreateSliderOptions, SliderApi } from "@forge-ui/slider";
import { connectSlider, createSliderMachine } from "@forge-ui/slider";
import { useId, useLayoutEffect, useState } from "react";
import { useMachine } from "../../use-machine.js";

export interface UseSliderOptions extends Omit<CreateSliderOptions, "id"> {
  id?: string;
}

export function useSlider(options: UseSliderOptions = {}): SliderApi {
  const reactId = useId();
  const id = options.id ?? reactId.replace(/:/g, "");

  const [machine] = useState(() => createSliderMachine({ id, ...options }));
  const [snapshot, send] = useMachine(machine);

  // Sync controlled values into the machine context directly.
  useLayoutEffect(() => {
    if (options.value !== undefined) {
      const vals = Array.isArray(options.value) ? options.value : [options.value];
      machine.update({ values: vals });
    }
  // biome-ignore lint/correctness/useExhaustiveDependencies: options.value identity change triggers sync
  }, [options.value]);

  return connectSlider(snapshot, send, machine);
}
