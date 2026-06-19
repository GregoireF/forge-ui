import type { CreateHoverCardMachineOptions, HoverCardPositioning, HoverCardSend } from "@forge-ui/hover-card";
import { connectHoverCard, createHoverCardMachine } from "@forge-ui/hover-card";
import { computed, useId, watchEffect } from "vue";
import { useMachine } from "../../use-machine.js";

export interface UseHoverCardOptions extends Omit<CreateHoverCardMachineOptions, "id"> {
  id?: string;
  positioning?: HoverCardPositioning;
}

export function useHoverCard(options: UseHoverCardOptions = {}) {
  const vueId = useId();
  const id = options.id ?? vueId;

  const machine = createHoverCardMachine({
    id,
    openDelay: options.openDelay ?? 700,
    closeDelay: options.closeDelay ?? 300,
    ...(options.positioning !== undefined && { positioning: options.positioning }),
    ...(options.onOpenChange !== undefined && { onOpenChange: options.onOpenChange }),
  });

  // Sync mutable context from options — runs on mount and when reactive deps change.
  watchEffect(() => {
    machine.setContext({
      openDelay: options.openDelay ?? 700,
      closeDelay: options.closeDelay ?? 300,
      ...(options.onOpenChange !== undefined && { onOpenChange: options.onOpenChange }),
    });
  });

  const { snapshot, send } = useMachine(machine);
  const api = computed(() => connectHoverCard(snapshot.value, send, machine));

  const isOpen = computed(() => api.value.isOpen);

  return {
    isOpen,
    send: send as HoverCardSend,
    getTriggerProps: (): ReturnType<typeof api.value.getTriggerProps> => api.value.getTriggerProps(),
    getPositionerProps: (): ReturnType<typeof api.value.getPositionerProps> => api.value.getPositionerProps(),
    getContentProps: (): ReturnType<typeof api.value.getContentProps> => api.value.getContentProps(),
    getArrowProps: (): ReturnType<typeof api.value.getArrowProps> => api.value.getArrowProps(),
  };
}
