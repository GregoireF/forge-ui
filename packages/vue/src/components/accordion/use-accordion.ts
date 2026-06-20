import { connectAccordion, createAccordionMachine } from "@forge-ui/accordion";
import type { CreateAccordionOptions } from "@forge-ui/accordion";
import { computed, useId, watch } from "vue";
import { useMachine } from "../../use-machine.js";

export interface UseAccordionOptions extends Omit<CreateAccordionOptions, "id"> {
  id?: string;
}

export function useAccordion(options: UseAccordionOptions = {}) {
  const vueId = useId();
  const id = options.id ?? vueId;

  const machine = createAccordionMachine({ id, ...options });
  const { snapshot, send } = useMachine(machine);

  // Sync controlled `value` prop
  if (options.value !== undefined) {
    watch(
      () => options.value,
      (v) => {
        if (v === undefined) return;
        const normalized = Array.isArray(v) ? v : [v];
        const current = machine.getSnapshot().context.value;
        if (JSON.stringify(current) === JSON.stringify(normalized)) return;
        machine.send({ type: "SET_VALUE", value: normalized });
      },
      { immediate: true },
    );
  }

  const api = computed(() => connectAccordion(snapshot.value, send, machine));

  return {
    value: computed(() => api.value.value),
    disabled: computed(() => api.value.disabled),
    send,
    getRootProps: () => api.value.getRootProps(),
    getItemProps: (itemValue: string) => api.value.getItemProps(itemValue),
    getHeaderProps: (itemValue: string) => api.value.getHeaderProps(itemValue),
    getTriggerProps: (itemValue: string) => api.value.getTriggerProps(itemValue),
    getContentProps: (itemValue: string) => api.value.getContentProps(itemValue),
  };
}

export type UseAccordionReturn = ReturnType<typeof useAccordion>;
