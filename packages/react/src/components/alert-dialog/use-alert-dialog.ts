import type { CreateAlertDialogMachineOptions } from "@forge-ui/alert-dialog";
import { connectAlertDialog, createAlertDialogMachine } from "@forge-ui/alert-dialog";
import { useId, useLayoutEffect, useState } from "react";
import { useMachine } from "../../use-machine.js";

export interface UseAlertDialogOptions extends Omit<CreateAlertDialogMachineOptions, "id"> {
  id?: string;
  defaultOpen?: boolean;
}

export function useAlertDialog(options: UseAlertDialogOptions = {}) {
  const reactId = useId();
  const id = options.id ?? reactId.replace(/:/g, "");

  const [machine] = useState(() => createAlertDialogMachine({ id, ...options }));

  const { open } = options;
  useLayoutEffect(() => {
    if (open === undefined) return;
    const machineIsOpen = machine.getSnapshot().matches("open");
    if (open !== machineIsOpen) machine.send(open ? "OPEN" : "CLOSE");
  }, [open, machine]);

  const [snapshot, send] = useMachine(machine);

  return {
    ...connectAlertDialog(snapshot, send, machine),
    send,
    setOpen: (open: boolean) => send(open ? "OPEN" : "CLOSE"),
  };
}
