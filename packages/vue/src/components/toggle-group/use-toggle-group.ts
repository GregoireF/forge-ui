import type { CreateToggleGroupOptions } from "@forge-ui/toggle-group";
import { connectToggleGroup, createToggleGroupMachine } from "@forge-ui/toggle-group";
import { computed, useId, watch } from "vue";
import { useMachine } from "../../use-machine.js";

export interface UseToggleGroupOptions extends Omit<CreateToggleGroupOptions, "id"> {
  id?: string;
}

export function useToggleGroup(options: UseToggleGroupOptions = {}) {
  const vueId = useId();
  const id = options.id ?? vueId;

  const machine = createToggleGroupMachine({ id, ...options });
  const { snapshot, send } = useMachine(machine);

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

  const api = computed(() => connectToggleGroup(snapshot.value, send, machine));

  return {
    value: computed(() => api.value.value),
    isDisabled: computed(() => api.value.disabled),
    send,
    isItemPressed: (v: string) => api.value.isItemPressed(v),
    getRootProps: () => api.value.getRootProps(),
    getItemProps: (v: string, disabled?: boolean) => api.value.getItemProps(v, disabled),
  };
}

export type UseToggleGroupReturn = ReturnType<typeof useToggleGroup>;
