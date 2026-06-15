import type { CreateDialogMachineOptions } from "@forge-ui/dialog";
import { connectDialog, createDialogMachine } from "@forge-ui/dialog";
import { computed, useId } from "vue";
import { useMachine } from "../../use-machine.js";

export interface UseDialogOptions extends Omit<CreateDialogMachineOptions, "id"> {
  id?: string;
}

export function useDialog(options: UseDialogOptions = {}) {
  const vueId = useId();
  const id = options.id ?? vueId;

  const machine = createDialogMachine({ id, ...options });
  const { snapshot, send } = useMachine(machine);

  const isOpen = computed(() => snapshot.value.matches("open"));

  // Single connectDialog instance per snapshot — avoids creating N instances
  // per-render (one per getter call in the old pattern).
  const api = computed(() => connectDialog(snapshot.value, send, machine));

  return {
    isOpen,
    snapshot,
    send,
    setOpen: (open: boolean) => send(open ? "OPEN" : "CLOSE"),
    getTriggerProps: () => api.value.getTriggerProps(),
    getOverlayProps: () => api.value.getOverlayProps(),
    getBackdropProps: () => api.value.getBackdropProps(),
    getContentProps: () => api.value.getContentProps(),
    getTitleProps: () => api.value.getTitleProps(),
    getDescriptionProps: () => api.value.getDescriptionProps(),
    getCloseProps: () => api.value.getCloseProps(),
  };
}
