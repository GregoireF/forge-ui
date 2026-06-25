import type { CreateDateFieldOptions } from "@forge-ui/date-field";
import { connectDateField, createDateFieldMachine } from "@forge-ui/date-field";
import { computed, useId, watch } from "vue";
import { useMachine } from "../../use-machine.js";

export interface UseDateFieldOptions extends Omit<CreateDateFieldOptions, "id"> {
  id?: string;
}

export function useDateField(options: UseDateFieldOptions = {}) {
  const vueId = useId();
  const id = options.id ?? vueId;

  const machine = createDateFieldMachine({ id, ...options });
  const { snapshot, send } = useMachine(machine);

  const api = computed(() => connectDateField(snapshot.value, send, machine));

  return {
    assembledDate: computed(() => api.value.assembledDate),
    isoValue: computed(() => api.value.isoValue),
    focusedSegment: computed(() => api.value.focusedSegment),
    displayValues: computed(() => api.value.displayValues),
    machine,
    send,
    getGroupProps: () => api.value.getGroupProps(),
    getMonthSegmentProps: () => api.value.getMonthSegmentProps(),
    getDaySegmentProps: () => api.value.getDaySegmentProps(),
    getYearSegmentProps: () => api.value.getYearSegmentProps(),
    getSeparatorProps: () => api.value.getSeparatorProps(),
    getHiddenInputProps: (name: string) => api.value.getHiddenInputProps(name),
  };
}

export type UseDateFieldReturn = ReturnType<typeof useDateField>;

export function useDateFieldControlled(
  propsValue: () => CreateDateFieldOptions["value"] | undefined,
  options: UseDateFieldOptions = {},
) {
  const api = useDateField(options);
  watch(propsValue, (v) => {
    if (v !== undefined) {
      api.machine.update({
        dayValue: v?.day ?? null,
        monthValue: v?.month ?? null,
        yearValue: v?.year ?? null,
      });
    }
  });
  return api;
}
