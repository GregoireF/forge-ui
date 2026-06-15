import type { CreatePopoverMachineOptions } from "@forge-ui/popover";
import { connectPopover, createPopoverMachine } from "@forge-ui/popover";
import { computed, useId } from "vue";
import { useMachine } from "../../use-machine.js";

export interface UsePopoverOptions extends Omit<CreatePopoverMachineOptions, "id"> {
  id?: string;
}

export function usePopover(options: UsePopoverOptions = {}) {
  const vueId = useId();
  const id = options.id ?? vueId;

  const machine = createPopoverMachine({ id, ...options });
  const { snapshot, send } = useMachine(machine);

  const isOpen = computed(() => snapshot.value.matches("open"));
  const api = computed(() => connectPopover(snapshot.value, send, machine));

  return {
    isOpen,
    snapshot,
    send,
    setOpen: (open: boolean) => send(open ? "OPEN" : "CLOSE"),
    getTriggerProps: () => api.value.getTriggerProps(),
    getAnchorProps: () => api.value.getAnchorProps(),
    getPositionerProps: () => api.value.getPositionerProps(),
    getContentProps: () => api.value.getContentProps(),
    getArrowProps: () => api.value.getArrowProps(),
    getArrowTipProps: () => api.value.getArrowTipProps(),
    getCloseProps: () => api.value.getCloseProps(),
    getTitleProps: () => api.value.getTitleProps(),
    getDescriptionProps: () => api.value.getDescriptionProps(),
  };
}
