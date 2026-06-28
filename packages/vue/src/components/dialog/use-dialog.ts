import type { CreateDialogMachineOptions, DialogContentCallbacks } from "@forge-ui/dialog";
import { connectDialog, createDialogMachine } from "@forge-ui/dialog";
import { computed, useId } from "vue";
import { useMachine } from "../../use-machine.js";

export interface UseDialogOptions extends Omit<CreateDialogMachineOptions, "id" | "role"> {
  id?: string;
  /** Uncontrolled initial open state. Use instead of open when you don't need external state. */
  defaultOpen?: boolean;
}

export function useDialog(options: UseDialogOptions = {}) {
  const vueId = useId();
  const id = options.id ?? vueId;

  const machine = createDialogMachine({ id, ...options });
  const { snapshot, send } = useMachine(machine);

  const isOpen = computed(() => snapshot.value.matches("open"));
  const titleRegistered = computed(() => snapshot.value.context.titleRegistered);
  const descriptionRegistered = computed(() => snapshot.value.context.descriptionRegistered);

  // Single connectDialog instance per snapshot — avoids creating N instances
  // per-render (one per getter call in the old pattern).
  const api = computed(() => connectDialog(snapshot.value, send, machine));

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
    getCloseProps: () => api.value.getCloseProps(),
    setContentCallbacks: (callbacks: DialogContentCallbacks) =>
      api.value.setContentCallbacks(callbacks),
  };
}
