import type { CreatePopoverMachineOptions } from "@forge-ui/popover";
import { connectPopover, createPopoverMachine } from "@forge-ui/popover";
import { useId, useState } from "react";
import { useMachine } from "../../use-machine.js";

export interface UsePopoverOptions extends Omit<CreatePopoverMachineOptions, "id"> {
  id?: string;
}

export function usePopover(options: UsePopoverOptions = {}) {
  const reactId = useId();
  const id = options.id ?? reactId.replace(/:/g, "");

  const [machine] = useState(() => createPopoverMachine({ id, ...options }));
  const [snapshot, send] = useMachine(machine);

  return {
    ...connectPopover(snapshot, send, machine),
    send,
    setOpen: (open: boolean) => send(open ? "OPEN" : "CLOSE"),
  };
}
