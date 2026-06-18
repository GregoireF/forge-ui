import type { CreateSwitchMachineOptions } from "@forge-ui/switch";
import { connectSwitch, createSwitchMachine } from "@forge-ui/switch";
import { computed, useId, watch } from "vue";
import { useMachine } from "../../use-machine.js";

export interface UseSwitchOptions extends Omit<CreateSwitchMachineOptions, "id"> {
  id?: string;
}

export function useSwitch(options: UseSwitchOptions = {}) {
  const vueId = useId();
  const id = options.id ?? vueId;

  const machine = createSwitchMachine({ id, ...options });
  const { snapshot, send } = useMachine(machine);

  if (options.checked !== undefined) {
    watch(
      () => options.checked,
      (checked) => {
        if (checked === undefined) return;
        const state = machine.getSnapshot().value as string;
        const target = checked ? "on" : "off";
        if (state === target) return;
        machine.send(checked ? "CHECK" : "UNCHECK");
      },
      { immediate: true },
    );
  }

  const api = computed(() => connectSwitch(snapshot.value, send, machine));

  return {
    isChecked: computed(() => api.value.isChecked),
    dataState: computed(() => api.value.dataState),
    isDisabled: computed(() => api.value.isDisabled),
    send,
    getRootProps: () => api.value.getRootProps(),
    getControlProps: () => api.value.getControlProps(),
    getThumbProps: () => api.value.getThumbProps(),
    getLabelProps: () => api.value.getLabelProps(),
    getHiddenInputProps: () => api.value.getHiddenInputProps(),
  };
}

export type UseSwitchReturn = ReturnType<typeof useSwitch>;
