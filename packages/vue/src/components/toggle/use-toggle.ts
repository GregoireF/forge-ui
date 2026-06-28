import type { CreateToggleOptions } from "@forge-ui/toggle";
import { connectToggle, createToggleMachine } from "@forge-ui/toggle";
import { computed, useId, watch } from "vue";
import { useMachine } from "../../use-machine.js";

export interface UseToggleOptions extends Omit<CreateToggleOptions, "id"> {
  id?: string;
}

export function useToggle(options: UseToggleOptions = {}) {
  const vueId = useId();
  const id = options.id ?? vueId;

  const machine = createToggleMachine({ id, ...options });
  const { snapshot, send } = useMachine(machine);

  if (options.pressed !== undefined) {
    watch(
      () => options.pressed,
      (pressed) => {
        if (pressed === undefined) return;
        const state = machine.getSnapshot().value as string;
        const target = pressed ? "on" : "off";
        if (state === target) return;
        machine.send(pressed ? { type: "PRESS" } : { type: "RELEASE" });
      },
      { immediate: true },
    );
  }

  const api = computed(() => connectToggle(snapshot.value, send, machine));

  return {
    isPressed: computed(() => api.value.isPressed),
    isDisabled: computed(() => api.value.isDisabled),
    send,
    getRootProps: () => api.value.getRootProps(),
  };
}

export type UseToggleReturn = ReturnType<typeof useToggle>;
