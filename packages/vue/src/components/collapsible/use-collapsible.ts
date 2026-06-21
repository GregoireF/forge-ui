import type { CreateCollapsibleOptions } from "@forge-ui/collapsible";
import { connectCollapsible, createCollapsibleMachine } from "@forge-ui/collapsible";
import { computed, useId, watch } from "vue";
import { useMachine } from "../../use-machine.js";

export interface UseCollapsibleOptions extends Omit<CreateCollapsibleOptions, "id"> {
  id?: string;
}

export function useCollapsible(options: UseCollapsibleOptions = {}) {
  const vueId = useId();
  const id = options.id ?? vueId;

  const machine = createCollapsibleMachine({ id, ...options });
  const { snapshot, send } = useMachine(machine);

  if (options.open !== undefined) {
    watch(
      () => options.open,
      (v) => {
        if (v !== machine.getSnapshot().context.open) {
          machine.send({ type: "SET_OPEN", open: v ?? false });
        }
      },
      { immediate: true },
    );
  }

  const api = computed(() => connectCollapsible(snapshot.value, send, machine));

  return {
    isOpen: computed(() => api.value.isOpen),
    disabled: computed(() => api.value.disabled),
    send,
    getRootProps: () => api.value.getRootProps(),
    getTriggerProps: () => api.value.getTriggerProps(),
    getContentProps: () => api.value.getContentProps(),
  };
}

export type UseCollapsibleReturn = ReturnType<typeof useCollapsible>;
