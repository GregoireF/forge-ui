import type { CreateAvatarOptions } from "@forge-ui/avatar";
import { connectAvatar, createAvatarMachine } from "@forge-ui/avatar";
import { computed, useId } from "vue";
import { useMachine } from "../../use-machine.js";

export interface UseAvatarOptions extends Omit<CreateAvatarOptions, "id" | "src"> {
  id?: string;
}

export function useAvatar(options: UseAvatarOptions = {}) {
  const vueId = useId();
  const id = options.id ?? vueId;

  const machine = createAvatarMachine({ id, ...options });
  const { snapshot, send } = useMachine(machine);

  const api = computed(() => connectAvatar(snapshot.value, send, machine));

  return {
    status: computed(() => api.value.status),
    isLoaded: computed(() => api.value.isLoaded),
    isLoading: computed(() => api.value.isLoading),
    hasError: computed(() => api.value.hasError),
    isIdle: computed(() => api.value.isIdle),
    initials: computed(() => api.value.initials),
    setSrc: (src: string | undefined) => api.value.setSrc(src),
    send,
    getRootProps: () => api.value.getRootProps(),
    getImageProps: () => api.value.getImageProps(),
    getFallbackProps: () => api.value.getFallbackProps(),
  };
}

export type UseAvatarReturn = ReturnType<typeof useAvatar>;
