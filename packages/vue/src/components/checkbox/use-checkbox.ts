import type { CheckboxChecked, CreateCheckboxMachineOptions } from "@forge-ui/checkbox";
import { connectCheckbox, createCheckboxMachine } from "@forge-ui/checkbox";
import { computed, useId, watch } from "vue";
import { useMachine } from "../../use-machine.js";

export interface UseCheckboxOptions extends Omit<CreateCheckboxMachineOptions, "id"> {
  id?: string;
}

export function useCheckbox(options: UseCheckboxOptions = {}) {
  const vueId = useId();
  const id = options.id ?? vueId;

  const machine = createCheckboxMachine({ id, ...options });
  const { snapshot, send } = useMachine(machine);

  // Sync controlled `checked` prop.
  if (options.checked !== undefined) {
    watch(
      () => options.checked,
      (checked) => {
        if (checked === undefined) return;
        const state = machine.getSnapshot().value as string;
        const target =
          checked === "indeterminate" ? "indeterminate" : checked ? "checked" : "unchecked";
        if (state === target) return;
        if (checked === "indeterminate") machine.send("SET_INDETERMINATE");
        else if (checked) machine.send("CHECK");
        else machine.send("UNCHECK");
      },
      { immediate: true },
    );
  }

  const api = computed(() => connectCheckbox(snapshot.value, send, machine));

  return {
    isChecked: computed(() => api.value.isChecked),
    isIndeterminate: computed(() => api.value.isIndeterminate),
    dataState: computed(() => api.value.dataState),
    isDisabled: computed(() => api.value.isDisabled),
    send,
    getRootProps: () => api.value.getRootProps(),
    getControlProps: () => api.value.getControlProps(),
    getIndicatorProps: () => api.value.getIndicatorProps(),
    getLabelProps: () => api.value.getLabelProps(),
    getHiddenInputProps: () => api.value.getHiddenInputProps(),
  };
}

export type UseCheckboxReturn = ReturnType<typeof useCheckbox>;
export type { CheckboxChecked };
