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
  const [snapshot, send] = useMachine(machine);

  return {
    ...connectDialog(snapshot, send, machine),
    send,
    setOpen: (open: boolean) => send(open ? "OPEN" : "CLOSE"),
  };
}
