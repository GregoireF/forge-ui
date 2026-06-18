import type { ComboboxApi, ComboboxSend, CreateComboboxMachineOptions } from "@forge-ui/combobox";
import { connectCombobox, createComboboxMachine } from "@forge-ui/combobox";
import { useId, useState } from "react";
import { useMachine } from "../../use-machine.js";

export interface UseComboboxOptions extends Omit<CreateComboboxMachineOptions, "id"> {
  id?: string;
}

export interface UseComboboxReturn extends ComboboxApi {
  send: ComboboxSend;
  setOpen: (open: boolean) => void;
}

export function useCombobox(options: UseComboboxOptions = {}): UseComboboxReturn {
  const reactId = useId();
  const id = options.id ?? reactId.replace(/:/g, "");

  const [machine] = useState(() => createComboboxMachine({ id, ...options }));
  const [snapshot, send] = useMachine(machine);

  return {
    ...connectCombobox(snapshot, send, machine),
    send,
    setOpen: (open: boolean) => send(open ? "OPEN" : "CLOSE"),
  };
}
