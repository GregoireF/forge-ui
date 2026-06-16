import type { CreateSelectMachineOptions, SelectApi, SelectSend } from "@forge-ui/select";
import { connectSelect, createSelectMachine } from "@forge-ui/select";
import { useId, useState } from "react";
import { useMachine } from "../../use-machine.js";

export interface UseSelectOptions extends Omit<CreateSelectMachineOptions, "id"> {
  id?: string;
}

export interface UseSelectReturn extends SelectApi {
  send: SelectSend;
  setOpen: (open: boolean) => void;
}

export function useSelect(options: UseSelectOptions = {}): UseSelectReturn {
  const reactId = useId();
  const id = options.id ?? reactId.replace(/:/g, "");

  const [machine] = useState(() => createSelectMachine({ id, ...options }));
  const [snapshot, send] = useMachine(machine);

  return {
    ...connectSelect(snapshot, send, machine),
    send,
    setOpen: (open: boolean) => send(open ? "OPEN" : "CLOSE"),
  };
}
