import type { CreateAlertDialogMachineOptions } from "@forge-ui/alert-dialog";
import { connectAlertDialog, createAlertDialogMachine } from "@forge-ui/alert-dialog";
import { useId, useState } from "react";
import { useMachine } from "../../use-machine.js";

export interface UseAlertDialogOptions extends Omit<CreateAlertDialogMachineOptions, "id"> {
  id?: string;
  defaultOpen?: boolean;
}

export function useAlertDialog(options: UseAlertDialogOptions = {}) {
  const reactId = useId();
  const id = options.id ?? reactId.replace(/:/g, "");

  const [machine] = useState(() => createAlertDialogMachine({ id, ...options }));

  // Sync controlled open prop during render (same pattern as useDialog).
  machine.start();
  if (options.open !== undefined) {
    const machineIsOpen = machine.getSnapshot().matches("open");
    if (options.open !== machineIsOpen) {
      machine.send(options.open ? "OPEN" : "CLOSE");
    }
  }

  const [snapshot, send] = useMachine(machine);

  return {
    ...connectAlertDialog(snapshot, send, machine),
    send,
    setOpen: (open: boolean) => send(open ? "OPEN" : "CLOSE"),
  };
}
