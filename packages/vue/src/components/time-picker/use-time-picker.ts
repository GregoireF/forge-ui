import type { CreateTimePickerOptions } from "@forge-ui/time-picker";
import { connectTimePicker, createTimePickerMachine } from "@forge-ui/time-picker";
import { computed, useId } from "vue";
import { useMachine } from "../../use-machine.js";

export interface UseTimePickerOptions extends Omit<CreateTimePickerOptions, "id"> {
  id?: string;
}

export function useTimePicker(options: UseTimePickerOptions = {}) {
  const vueId = useId();
  const id = options.id ?? vueId;

  const machine = createTimePickerMachine({ id, ...options });
  const { snapshot, send } = useMachine(machine);

  const api = computed(() => connectTimePicker(snapshot.value, send, machine));

  return {
    assembledTime: computed(() => api.value.assembledTime),
    isoValue: computed(() => api.value.isoValue),
    period: computed(() => api.value.period),
    focusedSegment: computed(() => api.value.focusedSegment),
    displayValues: computed(() => api.value.displayValues),
    machine,
    send,
    getGroupProps: () => api.value.getGroupProps(),
    getHoursSegmentProps: () => api.value.getHoursSegmentProps(),
    getMinutesSegmentProps: () => api.value.getMinutesSegmentProps(),
    getSecondsSegmentProps: () => api.value.getSecondsSegmentProps(),
    getPeriodSegmentProps: () => api.value.getPeriodSegmentProps(),
    getSeparatorProps: () => api.value.getSeparatorProps(),
    getHiddenInputProps: (name: string) => api.value.getHiddenInputProps(name),
  };
}

export type UseTimePickerReturn = ReturnType<typeof useTimePicker>;
