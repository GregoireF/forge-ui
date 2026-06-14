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

  function getApi() {
    return connectDialog(snapshot.value, send, machine);
  }

  return {
    isOpen,
    snapshot,
    send,
    setOpen: (open: boolean) => send(open ? "OPEN" : "CLOSE"),
    getTriggerProps: () => getApi().getTriggerProps(),
    getBackdropProps: () => getApi().getBackdropProps(),
    getContentProps: () => getApi().getContentProps(),
    getTitleProps: () => getApi().getTitleProps(),
    getDescriptionProps: () => getApi().getDescriptionProps(),
    getCloseProps: () => getApi().getCloseProps(),
  };
}
