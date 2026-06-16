import type { CreateAlertDialogMachineOptions } from "@forge-ui/alert-dialog";
import type { AlertDialogContentCallbacks } from "@forge-ui/alert-dialog";
import { connectAlertDialog, createAlertDialogMachine } from "@forge-ui/alert-dialog";
import { computed, useId } from "vue";
import { useMachine } from "../../use-machine.js";

export interface UseAlertDialogOptions extends Omit<CreateAlertDialogMachineOptions, "id"> {
  id?: string;
  defaultOpen?: boolean;
}

export function useAlertDialog(options: UseAlertDialogOptions = {}) {
  const vueId = useId();
  const id = options.id ?? vueId;

  const machine = createAlertDialogMachine({ id, ...options });
  const { snapshot, send } = useMachine(machine);

  const isOpen = computed(() => snapshot.value.matches("open"));
  const titleRegistered = computed(() => snapshot.value.context.titleRegistered);
  const descriptionRegistered = computed(() => snapshot.value.context.descriptionRegistered);

  const api = computed(() => connectAlertDialog(snapshot.value, send, machine));

  return {
    isOpen,
    titleRegistered,
    descriptionRegistered,
    snapshot,
    send,
    setOpen: (open: boolean) => send(open ? "OPEN" : "CLOSE"),
    getTriggerProps: () => api.value.getTriggerProps(),
    getOverlayProps: () => api.value.getOverlayProps(),
    getContentProps: () => api.value.getContentProps(),
    getTitleProps: () => api.value.getTitleProps(),
    getDescriptionProps: () => api.value.getDescriptionProps(),
    getCancelProps: () => api.value.getCancelProps(),
    getActionProps: () => api.value.getActionProps(),
    setContentCallbacks: (callbacks: AlertDialogContentCallbacks) =>
      api.value.setContentCallbacks(callbacks),
  };
}
