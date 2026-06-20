import type { CreateSliderOptions } from "@forge-ui/slider";
import { connectSlider, createSliderMachine } from "@forge-ui/slider";
import { computed, useId, watch } from "vue";
import { useMachine } from "../../use-machine.js";

export interface UseSliderOptions extends Omit<CreateSliderOptions, "id"> {
  id?: string;
}

export function useSlider(options: UseSliderOptions = {}) {
  const vueId = useId();
  const id = options.id ?? vueId;

  const machine = createSliderMachine({ id, ...options });
  const { snapshot, send } = useMachine(machine);

  if (options.value !== undefined) {
    watch(
      () => options.value,
      (v) => {
        if (v !== undefined && v !== machine.getSnapshot().context.value) {
          machine.send({ type: "SET_VALUE", value: v });
        }
      },
      { immediate: true },
    );
  }

  const api = computed(() => connectSlider(snapshot.value, send, machine));

  return {
    value: computed(() => api.value.value),
    percent: computed(() => api.value.percent),
    isDragging: computed(() => api.value.isDragging),
    send,
    getRootProps: () => api.value.getRootProps(),
    getTrackProps: () => api.value.getTrackProps(),
    getRangeProps: () => api.value.getRangeProps(),
    getThumbProps: () => api.value.getThumbProps(),
    getHiddenInputProps: (name?: string) => api.value.getHiddenInputProps(name),
  };
}

export type UseSliderReturn = ReturnType<typeof useSlider>;
