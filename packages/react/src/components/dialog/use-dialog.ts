import type { CreateDialogMachineOptions } from "@forge-ui/dialog";
import { connectDialog, createDialogMachine } from "@forge-ui/dialog";
import { useId, useLayoutEffect, useState } from "react";
import { useMachine } from "../../use-machine.js";

export interface UseDialogOptions extends Omit<CreateDialogMachineOptions, "id" | "role"> {
  id?: string;
  /** Uncontrolled initial open state. Use instead of open when you don't need external state. */
  defaultOpen?: boolean;
}

export function useDialog(options: UseDialogOptions = {}) {
  const reactId = useId();
  const id = options.id ?? reactId.replace(/:/g, "");

  const [machine] = useState(() => createDialogMachine({ id, ...options }));

  // Sync controlled `open` prop via layout effect — avoids "setState during render" warning.
  // useLayoutEffect fires before paint so there is no visible flash.
  const { open } = options;
  useLayoutEffect(() => {
    if (open === undefined) return;
    const machineIsOpen = machine.getSnapshot().matches("open");
    if (open !== machineIsOpen) machine.send(open ? "OPEN" : "CLOSE");
  }, [open, machine]);

  const [snapshot, send] = useMachine(machine);

  return {
    ...connectDialog(snapshot, send, machine),
    send,
    setOpen: (open: boolean) => send(open ? "OPEN" : "CLOSE"),
  };
}
