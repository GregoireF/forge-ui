import type { CreateDialogMachineOptions } from "@forge-ui/dialog";
import { connectDialog, createDialogMachine } from "@forge-ui/dialog";
import { useId, useState } from "react";
import { useMachine } from "../../use-machine.js";

export interface UseDialogOptions extends Omit<CreateDialogMachineOptions, "id"> {
  id?: string;
  /** Uncontrolled initial open state. Use instead of open when you don't need external state. */
  defaultOpen?: boolean;
}

export function useDialog(options: UseDialogOptions = {}) {
  const reactId = useId();
  const id = options.id ?? reactId.replace(/:/g, "");

  const [machine] = useState(() => createDialogMachine({ id, ...options }));

  // Sync controlled open prop during render so useSyncExternalStore captures the
  // correct state on the first render — no second render cycle per prop change.
  // machine.start() must be called first (idempotent; also called in useMachine)
  // because machine.send is a no-op while the machine is stopped.
  machine.start();
  if (options.open !== undefined) {
    const machineIsOpen = machine.getSnapshot().matches("open");
    if (options.open !== machineIsOpen) {
      machine.send(options.open ? "OPEN" : "CLOSE");
    }
  }

  const [snapshot, send] = useMachine(machine);

  return {
    ...connectDialog(snapshot, send, machine),
    send,
    setOpen: (open: boolean) => send(open ? "OPEN" : "CLOSE"),
  };
}
