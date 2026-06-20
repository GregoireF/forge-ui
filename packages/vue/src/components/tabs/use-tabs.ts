import type { CreateTabsOptions } from "@forge-ui/tabs";
import { connectTabs, createTabsMachine } from "@forge-ui/tabs";
import { computed, useId, watch } from "vue";
import { useMachine } from "../../use-machine.js";

export interface UseTabsOptions extends Omit<CreateTabsOptions, "id"> {
  id?: string;
}

export function useTabs(options: UseTabsOptions = {}) {
  const vueId = useId();
  const id = options.id ?? vueId;

  const machine = createTabsMachine({ id, ...options });
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

  const api = computed(() => connectTabs(snapshot.value, send, machine));

  return {
    value: computed(() => api.value.value),
    send,
    getRootProps: () => api.value.getRootProps(),
    getListProps: () => api.value.getListProps(),
    getTriggerProps: (tabValue: string) => api.value.getTriggerProps(tabValue),
    getPanelProps: (tabValue: string) => api.value.getPanelProps(tabValue),
  };
}

export type UseTabsReturn = ReturnType<typeof useTabs>;
