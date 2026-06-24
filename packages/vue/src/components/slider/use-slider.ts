import type { CreateSliderOptions } from "@forge-ui/slider";
import { connectSlider, createSliderMachine } from "@forge-ui/slider";
import { computed, useId } from "vue";
import { useMachine } from "../../use-machine.js";

export interface UseSliderOptions extends Omit<CreateSliderOptions, "id"> {
  id?: string;
}

export function useSlider(options: UseSliderOptions = {}) {
  const vueId = useId();
  const id = options.id ?? vueId;

  const machine = createSliderMachine({ id, ...options });
  const { snapshot, send } = useMachine(machine);

  const api = computed(() => connectSlider(snapshot.value, send, machine));

  return {
    values: computed(() => api.value.values),
    percents: computed(() => api.value.percents),
    isDragging: computed(() => api.value.isDragging),
    activeThumb: computed(() => api.value.activeThumb),
    machine,
    send,
    getRootProps: () => api.value.getRootProps(),
    getTrackProps: () => api.value.getTrackProps(),
    getRangeProps: () => api.value.getRangeProps(),
    getThumbProps: (thumbIndex: number) => api.value.getThumbProps(thumbIndex),
    getHiddenInputProps: (name?: string, thumbIndex = 0) => api.value.getHiddenInputProps(name, thumbIndex),
  };
}

export type UseSliderReturn = ReturnType<typeof useSlider>;
