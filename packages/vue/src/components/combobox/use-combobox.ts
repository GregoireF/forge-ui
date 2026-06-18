import type { ComboboxApi, ComboboxOption, ComboboxSend, CreateComboboxMachineOptions } from "@forge-ui/combobox";
import { connectCombobox, createComboboxMachine } from "@forge-ui/combobox";
import { computed, type ComputedRef, useId } from "vue";
import { useMachine } from "../../use-machine.js";

export interface UseComboboxOptions extends Omit<CreateComboboxMachineOptions, "id"> {
  id?: string;
}

export interface UseComboboxReturn {
  isOpen: ComputedRef<boolean>;
  send: ComboboxSend;
  setOpen: (open: boolean) => void;
  getInputValue: () => string;
  getValue: () => string[];
  getValueLabel: () => string;
  getFilteredOptions: () => ComboboxOption[];
  getLabelProps: () => ReturnType<ComboboxApi["getLabelProps"]>;
  getInputProps: () => ReturnType<ComboboxApi["getInputProps"]>;
  getTriggerProps: () => ReturnType<ComboboxApi["getTriggerProps"]>;
  getClearTriggerProps: () => ReturnType<ComboboxApi["getClearTriggerProps"]>;
  getPositionerProps: () => ReturnType<ComboboxApi["getPositionerProps"]>;
  getContentProps: () => ReturnType<ComboboxApi["getContentProps"]>;
  getOptionProps: (option: { value: string; disabled?: boolean }) => ReturnType<ComboboxApi["getOptionProps"]>;
}

export function useCombobox(options: UseComboboxOptions = {}): UseComboboxReturn {
  const vueId = useId();
  const id = options.id ?? vueId;

  const machine = createComboboxMachine({ id, ...options });
  const { snapshot, send } = useMachine(machine);

  const isOpen = computed(() => snapshot.value.matches("open"));
  const api = computed(() => connectCombobox(snapshot.value, send, machine));

  return {
    isOpen,
    send,
    setOpen: (open: boolean) => send(open ? "OPEN" : "CLOSE"),
    getInputValue: () => api.value.inputValue,
    getValue: () => api.value.value,
    getValueLabel: () => api.value.valueLabel,
    getFilteredOptions: () => api.value.filteredOptions,
    getLabelProps: () => api.value.getLabelProps(),
    getInputProps: () => api.value.getInputProps(),
    getTriggerProps: () => api.value.getTriggerProps(),
    getClearTriggerProps: () => api.value.getClearTriggerProps(),
    getPositionerProps: () => api.value.getPositionerProps(),
    getContentProps: () => api.value.getContentProps(),
    getOptionProps: (option: { value: string; disabled?: boolean }) =>
      api.value.getOptionProps({ value: option.value, disabled: option.disabled ?? false }),
  };
}
