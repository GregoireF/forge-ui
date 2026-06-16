import type { CreateSelectMachineOptions } from "@forge-ui/select";
import { connectSelect, createSelectMachine } from "@forge-ui/select";
import { computed, useId } from "vue";
import { useMachine } from "../../use-machine.js";

export interface UseSelectOptions extends Omit<CreateSelectMachineOptions, "id"> {
  id?: string;
}

export function useSelect(options: UseSelectOptions = {}) {
  const vueId = useId();
  const id = options.id ?? vueId;

  const machine = createSelectMachine({ id, ...options });
  const { snapshot, send } = useMachine(machine);

  const isOpen = computed(() => snapshot.value.matches("open"));
  const api = computed(() => connectSelect(snapshot.value, send, machine));

  return {
    isOpen,
    snapshot,
    send,
    setOpen: (open: boolean) => send(open ? "OPEN" : "CLOSE"),
    getValueLabel: () => api.value.valueLabel,
    getPlaceholder: () => api.value.placeholder,
    getValue: () => api.value.value,
    getLabelProps: () => api.value.getLabelProps(),
    getTriggerProps: () => api.value.getTriggerProps(),
    getPositionerProps: () => api.value.getPositionerProps(),
    getContentProps: () => api.value.getContentProps(),
    getOptionProps: (option: { value: string; disabled?: boolean }) =>
      api.value.getOptionProps({ value: option.value, disabled: option.disabled ?? false }),
  };
}
