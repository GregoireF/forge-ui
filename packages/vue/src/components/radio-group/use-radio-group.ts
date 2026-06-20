import type { CreateRadioGroupOptions } from "@forge-ui/radio-group";
import { connectRadioGroup, createRadioGroupMachine } from "@forge-ui/radio-group";
import { computed, useId, watch } from "vue";
import { useMachine } from "../../use-machine.js";

export interface UseRadioGroupOptions extends Omit<CreateRadioGroupOptions, "id"> {
  id?: string;
}

export function useRadioGroup(options: UseRadioGroupOptions = {}) {
  const vueId = useId();
  const id = options.id ?? vueId;

  const machine = createRadioGroupMachine({ id, ...options });
  const { snapshot, send } = useMachine(machine);

  if (options.value !== undefined) {
    watch(
      () => options.value,
      (v) => {
        if (v !== machine.getSnapshot().context.value) {
          machine.send({ type: "SET_VALUE", value: v });
        }
      },
      { immediate: true },
    );
  }

  const api = computed(() => connectRadioGroup(snapshot.value, send, machine));

  return {
    value: computed(() => api.value.value),
    disabled: computed(() => api.value.disabled),
    send,
    getRootProps: () => api.value.getRootProps(),
    getItemProps: (itemValue: string, itemDisabled?: boolean) =>
      api.value.getItemProps(itemValue, itemDisabled),
    getRadioProps: (itemValue: string, itemDisabled?: boolean) =>
      api.value.getRadioProps(itemValue, itemDisabled),
    getLabelProps: (itemValue: string) => api.value.getLabelProps(itemValue),
    getHiddenInputProps: (itemValue: string, itemDisabled?: boolean) =>
      api.value.getHiddenInputProps(itemValue, itemDisabled),
  };
}

export type UseRadioGroupReturn = ReturnType<typeof useRadioGroup>;
