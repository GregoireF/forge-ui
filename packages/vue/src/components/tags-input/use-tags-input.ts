import type { CreateTagsInputMachineOptions } from "@forge-ui/tags-input";
import { connectTagsInput, createTagsInputMachine } from "@forge-ui/tags-input";
import { computed, useId, watch } from "vue";
import { useMachine } from "../../use-machine.js";

export interface UseTagsInputOptions extends Omit<CreateTagsInputMachineOptions, "id"> {
  id?: string;
}

export function useTagsInput(options: UseTagsInputOptions = {}) {
  const vueId = useId();
  const id = options.id ?? vueId;

  const machine = createTagsInputMachine({ id, ...options });
  const { snapshot, send } = useMachine(machine);

  // Sync controlled `value` prop.
  if (options.value !== undefined) {
    watch(
      () => options.value,
      (value) => {
        if (value === undefined) return;
        machine.send({ type: "SET_VALUE", value });
      },
      { immediate: true },
    );
  }

  const api = computed(() => connectTagsInput(snapshot.value, send, machine));

  return {
    value: computed(() => api.value.value),
    inputValue: computed(() => api.value.inputValue),
    isFocused: computed(() => api.value.isFocused),
    isEmpty: computed(() => api.value.isEmpty),
    isDisabled: computed(() => api.value.isDisabled),
    isReadOnly: computed(() => api.value.isReadOnly),
    isRequired: computed(() => api.value.isRequired),
    isInvalid: computed(() => api.value.isInvalid),
    canAddMore: computed(() => api.value.canAddMore),
    send,
    getRootProps: () => api.value.getRootProps(),
    getLabelProps: () => api.value.getLabelProps(),
    getInputProps: () => api.value.getInputProps(),
    getTagProps: (value: string) => api.value.getTagProps(value),
    getTagDeleteProps: (value: string) => api.value.getTagDeleteProps(value),
    getHiddenInputProps: () => api.value.getHiddenInputProps(),
  };
}

export type UseTagsInputReturn = ReturnType<typeof useTagsInput>;
