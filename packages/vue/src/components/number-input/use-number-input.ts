import type { CreateNumberInputOptions } from "@forge-ui/number-input";
import { connectNumberInput, createNumberInputMachine } from "@forge-ui/number-input";
import { computed, useId } from "vue";
import { useMachine } from "../../use-machine.js";

export interface UseNumberInputOptions extends Omit<CreateNumberInputOptions, "id"> {
  id?: string;
}

export function useNumberInput(options: UseNumberInputOptions = {}) {
  const vueId = useId();
  const id = options.id ?? vueId;

  const machine = createNumberInputMachine({ id, ...options });
  const { snapshot, send } = useMachine(machine);

  const api = computed(() => connectNumberInput(snapshot.value, send, machine));

  return {
    value: computed(() => api.value.value),
    inputText: computed(() => api.value.inputText),
    focused: computed(() => api.value.focused),
    isSpinning: computed(() => api.value.isSpinning),
    machine,
    send,
    getLabelProps: () => api.value.getLabelProps(),
    getControlProps: () => api.value.getControlProps(),
    getInputProps: () => api.value.getInputProps(),
    getIncrementTriggerProps: () => api.value.getIncrementTriggerProps(),
    getDecrementTriggerProps: () => api.value.getDecrementTriggerProps(),
    getHiddenInputProps: (name?: string) => api.value.getHiddenInputProps(name),
  };
}

export type UseNumberInputReturn = ReturnType<typeof useNumberInput>;
